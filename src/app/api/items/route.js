// Next.js API Route - 유니크 아이템 시세 프록시

// 조회할 아이템 목록 (영문명 → 한글명, 이미지)
const TRACKED_ITEMS = {
  Mageblood: {
    nameKo: "마법사의 피",
    icon: "InjectorBelt.webp",
    type: "UniqueArmour",
  },
  Headhunter: {
    nameKo: "헤드헌터",
    icon: "Headhunter.webp",
    type: "UniqueArmour",
  },
  Nimis: {
    nameKo: "니미스",
    icon: "UberEaterofWorlds.webp",
    type: "UniqueAccessory",
  },
  "Original Sin": {
    nameKo: "원죄",
    icon: "SanctumSpecialUniqueRing.webp",
    type: "UniqueAccessory",
  },
  "Kalandra's Touch": {
    nameKo: "칼란드라의 손길",
    icon: "MirrorRing.webp",
    type: "UniqueAccessory",
  },
  Svalinn: {
    nameKo: "스발린",
    icon: "LayeredBarrierShield.webp",
    type: "UniqueArmour",
  },
  Progenesis: {
    nameKo: "전창조",
    icon: "UberMavenFlask.webp",
    type: "UniqueFlask",
  },
  "Wine of the Prophet": {
    nameKo: "예언자의 포도주",
    icon: "BottledFutures.webp",
    type: "UniqueFlask",
  },
  "Emperor's Wit": {
    nameKo: "황제의 재치",
    icon: "Wit.webp",
    type: "UniqueJewel",
  },
  "Emperor's Mastery": {
    nameKo: "황제의 숙련",
    icon: "Mastery.webp",
    type: "UniqueJewel",
  },
};

// 캐시 저장
let cachedData = null;
let cachedTimestamp = null;
const CACHE_DURATION = 3600 * 1000; // 1시간

// 현재 정시 timestamp 계산
function getCurrentHourTimestamp() {
  const now = new Date();
  const currentHour = new Date(now);
  currentHour.setMinutes(0, 0, 0);
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
        timestamp: getCurrentHourTimestamp(),
        items: cachedData,
        cached: true,
      });
    }

    const league = "Keepers";
    const types = [
      "UniqueArmour",
      "UniqueAccessory",
      "UniqueFlask",
      "UniqueJewel",
    ];

    // 모든 타입의 데이터 병렬로 가져오기
    const fetchPromises = types.map(async (type) => {
      const url = `https://poe.ninja/poe1/api/economy/stash/current/item/overview?league=${league}&type=${type}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "POE-Channel/1.0" },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        throw new Error(`POE Ninja API error for ${type}: ${response.status}`);
      }

      return response.json();
    });

    const results = await Promise.all(fetchPromises);

    // 모든 데이터를 합치기
    const allItems = results.flatMap((data) => data.lines || []);

    // 추적 아이템 필터링 및 매핑
    const items = [];
    for (const [name, info] of Object.entries(TRACKED_ITEMS)) {
      const found = allItems.find((item) => item.name === name);
      if (found) {
        items.push({
          name: found.name,
          nameKo: info.nameKo,
          icon: info.icon,
          divineValue: found.divineValue || 0,
          chaosValue: found.chaosValue || 0,
        });
      }
    }

    // 시세순 정렬 (높은 순)
    items.sort((a, b) => b.divineValue - a.divineValue);

    // 캐시 저장
    cachedData = items;
    cachedTimestamp = now;

    return Response.json({
      success: true,
      timestamp: getCurrentHourTimestamp(),
      items,
      cached: false,
    });
  } catch (error) {
    console.error("Unique items API error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
