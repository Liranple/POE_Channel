// Next.js API Route - 시세 히스토리 조회

import { getPriceHistory, getHistoryStats } from "@/lib/priceHistory";

/**
 * GET /api/history?type=currency|items|gems&limit=24
 *
 * Query Parameters:
 * - type: 조회할 API 타입 (currency, items, gems, 또는 stats)
 * - limit: 조회할 개수 (기본값: 24, 최대: 24)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 24);

    // 통계 조회
    if (type === "stats") {
      const stats = await getHistoryStats();
      return Response.json({
        success: true,
        stats,
      });
    }

    // 타입 검증
    if (!type || !["currency", "items", "gems"].includes(type)) {
      return Response.json(
        {
          success: false,
          error: "Invalid type. Must be one of: currency, items, gems, stats",
        },
        { status: 400 }
      );
    }

    // 히스토리 조회
    const history = await getPriceHistory(type, limit);

    return Response.json({
      success: true,
      type,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("History API Error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
