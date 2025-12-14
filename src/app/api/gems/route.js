// Next.js API Route - POE Ninja 서포트 젬 시세 프록시

import { GEM_NAME_TO_KOREAN } from "@/data/GemNameMapping";
import { GEM_VENDOR_INFO } from "@/data/GemVendorData";
import { CURRENT_LEAGUE, CACHE_DURATION } from "@/config/league";
import {
  savePriceHistory,
  getLatestHistory,
  fetchWithRetry,
} from "@/lib/priceHistory";

// 캐시된 데이터와 타임스탬프를 저장
let cachedData = null;
let cachedTimestamp = null;

// 현재 정시 timestamp 계산
function getCurrentHourTimestamp() {
  const now = new Date();
  const currentHour = new Date(now);
  currentHour.setMinutes(0, 0, 0); // 현재 정시로 설정
  return currentHour.getTime();
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
      return Response.json({
        success: true,
        league: cachedData.league,
        timestamp: getCurrentHourTimestamp(),
        gems: cachedData.gems,
        cached: true,
      });
    }

    const url = `https://poe.ninja/poe1/api/economy/stash/current/item/overview?league=${CURRENT_LEAGUE}&type=SkillGem`;

    let data;
    let fetchSuccess = false;

    try {
      // 리트라이가 포함된 fetch
      const response = await fetchWithRetry(url, {
        headers: { "User-Agent": "POE-Channel/1.0" },
        next: { revalidate: 3600 },
      });

      data = await response.json();
      fetchSuccess = true;
    } catch (fetchError) {
      console.error("All retries failed for gems API:", fetchError.message);

      // Fallback: DB에서 가장 최근 데이터 가져오기
      const fallbackData = await getLatestHistory("gems");
      if (fallbackData) {
        console.log(
          `[Gems] Using fallback data from ${new Date(
            fallbackData.timestamp
          ).toISOString()}`
        );

        const responseData = {
          success: true,
          league: fallbackData.data.league || CURRENT_LEAGUE,
          timestamp: fallbackData.timestamp,
          gems: fallbackData.data.gems,
          fallback: true,
        };

        // 메모리 캐시에도 저장
        cachedData = { league: CURRENT_LEAGUE, gems: fallbackData.data.gems };
        cachedTimestamp = now;

        return Response.json(responseData);
      }

      // Fallback도 없으면 에러 반환
      throw fetchError;
    }

    // 레벨 20, 퀄리티 20, 비타락, 서포트 젬만 필터링 (Awakened 제외, 20c 이상만)
    const MIN_CHAOS_VALUE = 20;
    const gems20 = data.lines
      .filter(
        (gem) =>
          gem.name.includes("Support") &&
          !gem.name.includes("Awakened") &&
          gem.gemLevel === 20 &&
          gem.gemQuality === 20 &&
          !gem.corrupted &&
          gem.chaosValue >= MIN_CHAOS_VALUE
      )
      .map((gem) => {
        const vendor = GEM_VENDOR_INFO[gem.name] || { act: 0, classes: [] };
        return {
          id: gem.id,
          name: gem.name,
          nameKo: GEM_NAME_TO_KOREAN[gem.name] || gem.name,
          icon: gem.icon,
          level: gem.gemLevel,
          quality: gem.gemQuality,
          chaosValue: Math.round(gem.chaosValue),
          vendor, // 구매 정보 추가
        };
      })
      .sort((a, b) => b.chaosValue - a.chaosValue);

    // 레벨 21, 퀄리티 20, 서포트 젬 (타락 젬이므로 corrupted = true, Awakened 제외)
    const gems21 = data.lines
      .filter(
        (gem) =>
          gem.name.includes("Support") &&
          !gem.name.includes("Awakened") &&
          gem.gemLevel === 21 &&
          gem.gemQuality === 20 &&
          gem.corrupted
      )
      .map((gem) => ({
        id: gem.id,
        name: gem.name,
        nameKo: GEM_NAME_TO_KOREAN[gem.name] || gem.name,
        icon: gem.icon,
        level: gem.gemLevel,
        quality: gem.gemQuality,
        chaosValue: Math.round(gem.chaosValue),
      }));

    // gems20 기준으로 정렬, gems21은 매칭을 위한 Map 생성
    const gems21Map = new Map(gems21.map((g) => [g.name, g]));

    // 20레벨 젬을 기준으로 21레벨 시세도 함께 반환
    const gems = gems20.map((gem) => ({
      ...gem,
      level21: gems21Map.get(gem.name) || null,
    }));

    // 캐시 저장
    cachedTimestamp = Date.now();
    cachedData = { league: CURRENT_LEAGUE, gems };

    // 히스토리에 저장 (성공한 경우에만, 백그라운드로 실행)
    if (fetchSuccess) {
      savePriceHistory("gems", { gems, league: CURRENT_LEAGUE }).catch((err) =>
        console.error("Failed to save gems history:", err)
      );
    }

    return Response.json({
      success: true,
      league: CURRENT_LEAGUE,
      timestamp: getCurrentHourTimestamp(),
      gems,
      cached: false,
    });
  } catch (error) {
    console.error("Gems API Error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
