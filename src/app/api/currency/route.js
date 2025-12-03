// Next.js API Route - POE Ninja 프록시 (CORS 우회)

// 메모리 캐싱
let cachedData = null;
let cachedTimestamp = null;
const CACHE_DURATION = 3600 * 1000; // 1시간

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
      now - cachedTimestamp < CACHE_DURATION
    ) {
      return Response.json(cachedData);
    }

    const league = "Keepers"; // 현재 리그명 (필요시 변경)
    const DIVINE_RATE = 160; // Divine 1개 = 약 160 Chaos (대략적인 환율)

    // 새로운 POE1 전용 API 엔드포인트
    const url = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${league}&type=DivinationCard`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "POE-Channel/1.0",
      },
      // 서버 사이드에서 1시간 캐싱
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`POE Ninja API error: ${response.status}`);
    }

    const data = await response.json();

    // 필요한 데이터만 추출 (모든 카드 포함)
    const cards = data.lines.map((card) => ({
      id: card.id,
      name: card.id
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "), // kebab-case를 Title Case로 변환
      chaosValue: Math.round(card.primaryValue),
      divineValue: Math.round((card.primaryValue / DIVINE_RATE) * 10) / 10, // 소숫점 1자리
      icon: `https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9JbnZlbnRvcnlJY29uIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/f34bf8cbb5/InventoryIcon.png`,
    }));

    // 정시 timestamp로 설정
    const hourTimestamp = getNextHourTimestamp();

    // 응답 데이터 생성 및 캐싱
    cachedData = {
      success: true,
      league,
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
