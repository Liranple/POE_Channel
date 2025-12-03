// Next.js API Route - POE Ninja 서포트 젬 시세 프록시

import { GEM_NAME_TO_KOREAN } from "@/data/GemNameMapping";
import { GEM_VENDOR_INFO } from "@/data/GemVendorData";

// 캐시된 데이터와 타임스탬프를 저장
let cachedData = null;
let cachedTimestamp = null;
const CACHE_DURATION = 3600 * 1000; // 1시간 (밀리초)

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
      now - cachedTimestamp < CACHE_DURATION
    ) {
      return Response.json({
        success: true,
        league: cachedData.league,
        timestamp: getCurrentHourTimestamp(),
        gems: cachedData.gems,
        cached: true,
      });
    }

    const league = "Keepers"; // 현재 리그명

    const url = `https://poe.ninja/poe1/api/economy/stash/current/item/overview?league=${league}&type=SkillGem`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "POE-Channel/1.0",
      },
      // 서버 사이드에서 1시간 캐싱 (백업)
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`POE Ninja API error: ${response.status}`);
    }

    const data = await response.json();

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
    cachedData = { league, gems };

    return Response.json({
      success: true,
      league,
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
