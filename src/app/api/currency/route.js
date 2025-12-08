// Next.js API Route - POE Ninja 프록시 (CORS 우회)

import { CURRENT_LEAGUE, CACHE_DURATION } from "@/config/league";

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

    // 카드 데이터와 Divine 시세를 병렬로 가져오기
    const [cardResponse, currencyResponse] = await Promise.all([
      fetch(cardUrl, {
        headers: { "User-Agent": "POE-Channel/1.0" },
        next: { revalidate: 3600 },
      }),
      fetch(currencyUrl, {
        headers: { "User-Agent": "POE-Channel/1.0" },
        next: { revalidate: 3600 },
      }),
    ]);

    if (!cardResponse.ok) {
      throw new Error(`POE Ninja Card API error: ${cardResponse.status}`);
    }

    const cardData = await cardResponse.json();

    // Divine Orb 시세 가져오기 (실패해도 기본값 사용)
    let divineRate = 160; // 기본값 (API 실패 시 fallback)
    if (currencyResponse.ok) {
      const currencyData = await currencyResponse.json();
      const divine = currencyData.lines?.find((c) => c.id === "divine-orb");
      if (divine?.primaryValue) {
        divineRate = divine.primaryValue;
      }
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
    };
    cachedTimestamp = now;

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
