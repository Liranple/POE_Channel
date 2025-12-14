// Next.js API Route - POE Ninja 프록시 (CORS 우회)

import { CURRENT_LEAGUE, CACHE_DURATION } from "@/config/league";
import {
  savePriceHistory,
  getLatestHistory,
  fetchWithRetry,
} from "@/lib/priceHistory";

// 메모리 캐싱
let cachedData = null;
let cachedTimestamp = null;

// 다음 정시 timestamp 계산
function getNextHourTimestamp() {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours(), 0, 0, 0); // 현재 정시로 설정
  return nextHour.getTime();
}

export async function GET() {
  try {
    const now = Date.now();

    // 캐시가 유효하면 캐시된 데이터 반환
    if (
      cachedData &&
      cachedTimestamp &&
      now - cachedTimestamp < CACHE_DURATION.API
    ) {
      return Response.json(cachedData);
    }

    // 새로운 POE1 전용 API 엔드포인트
    const cardUrl = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${CURRENT_LEAGUE}&type=DivinationCard`;
    const currencyUrl = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${CURRENT_LEAGUE}&type=Currency`;

    let cardData, divineRate;
    let fetchSuccess = false;

    try {
      // 리트라이가 포함된 fetch로 카드 데이터 가져오기
      const cardResponse = await fetchWithRetry(cardUrl, {
        headers: { "User-Agent": "POE-Channel/1.0" },
        next: { revalidate: 3600 },
      });

      cardData = await cardResponse.json();

      // Divine Orb 시세 가져오기 (실패해도 기본값 사용)
      divineRate = 160; // 기본값
      try {
        const currencyResponse = await fetchWithRetry(currencyUrl, {
          headers: { "User-Agent": "POE-Channel/1.0" },
          next: { revalidate: 3600 },
        });
        const currencyData = await currencyResponse.json();
        const divine = currencyData.lines?.find((c) => c.id === "divine-orb");
        if (divine?.primaryValue) {
          divineRate = divine.primaryValue;
        }
      } catch (currencyError) {
        console.warn(
          "Failed to fetch divine rate, using default:",
          currencyError.message
        );
      }

      fetchSuccess = true;
    } catch (fetchError) {
      console.error("All retries failed for currency API:", fetchError.message);

      // Fallback: DB에서 가장 최근 데이터 가져오기
      const fallbackData = await getLatestHistory("currency");
      if (fallbackData) {
        console.log(
          `[Currency] Using fallback data from ${new Date(
            fallbackData.timestamp
          ).toISOString()}`
        );

        const responseData = {
          success: true,
          league: fallbackData.data.league || CURRENT_LEAGUE,
          timestamp: fallbackData.timestamp,
          cards: fallbackData.data.cards,
          divineRate: fallbackData.data.divineRate,
          fallback: true, // 클라이언트에서 fallback 여부 확인 가능
        };

        // 메모리 캐시에도 저장 (다음 요청 시 빠른 응답)
        cachedData = responseData;
        cachedTimestamp = now;

        return Response.json(responseData);
      }

      // Fallback도 없으면 에러 반환
      throw fetchError;
    }

    // 필요한 데이터만 추출 (모든 카드 포함)
    const cards = cardData.lines.map((card) => ({
      id: card.id,
      name: card.id
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "), // kebab-case를 Title Case로 변환
      chaosValue: Math.round(card.primaryValue),
      divineValue: Math.round((card.primaryValue / divineRate) * 10) / 10, // 실시간 Divine 시세 적용
      icon: `https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9JbnZlbnRvcnlJY29uIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/f34bf8cbb5/InventoryIcon.png`,
    }));

    // 정시 timestamp로 설정
    const hourTimestamp = getNextHourTimestamp();

    // 응답 데이터 생성 및 캐싱
    cachedData = {
      success: true,
      league: CURRENT_LEAGUE,
      timestamp: hourTimestamp,
      cards,
      divineRate,
    };
    cachedTimestamp = now;

    // 히스토리에 저장 (성공한 경우에만, 백그라운드로 실행)
    if (fetchSuccess) {
      savePriceHistory("currency", {
        cards,
        divineRate,
        league: CURRENT_LEAGUE,
      }).catch((err) => console.error("Failed to save currency history:", err));
    }

    return Response.json(cachedData);
  } catch (error) {
    console.error("Currency API Error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
