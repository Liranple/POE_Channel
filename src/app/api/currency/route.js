// Next.js API Route - POE Ninja ?꾨줉??(CORS ?고쉶)

import { CURRENT_LEAGUE, CACHE_DURATION } from "@/config/league";
import {
  savePriceHistory,
  getLatestHistory,
  fetchWithRetry,
} from "@/lib/priceHistory";
import {
  POE_NINJA_BASE_URL,
  POE_NINJA_REQUEST_OPTIONS,
  getCurrentHourTimestamp,
} from "@/lib/poeNinja";

// 硫붾え由?罹먯떛
let cachedData = null;
let cachedTimestamp = null;


export async function GET() {
  try {
    const now = Date.now();

    // 罹먯떆媛 ?좏슚?섎㈃ 罹먯떆???곗씠??諛섑솚
    if (
      cachedData &&
      cachedTimestamp &&
      now - cachedTimestamp < CACHE_DURATION.API
    ) {
      return Response.json(cachedData);
    }

    // ?덈줈??POE1 ?꾩슜 API ?붾뱶?ъ씤??
    const cardUrl = `${POE_NINJA_BASE_URL}/exchange/current/overview?league=${CURRENT_LEAGUE}&type=DivinationCard`;
    const currencyUrl = `${POE_NINJA_BASE_URL}/exchange/current/overview?league=${CURRENT_LEAGUE}&type=Currency`;

    let cardData, divineRate;
    let fetchSuccess = false;

    try {
      // 由ы듃?쇱씠媛 ?ы븿??fetch濡?移대뱶 ?곗씠??媛?몄삤湲?
      const cardResponse = await fetchWithRetry(cardUrl, POE_NINJA_REQUEST_OPTIONS);

      cardData = await cardResponse.json();

      // Divine Orb ?쒖꽭 媛?몄삤湲?(?ㅽ뙣?대룄 湲곕낯媛??ъ슜)
      divineRate = 160; // 湲곕낯媛?
      try {
        const currencyResponse = await fetchWithRetry(currencyUrl, POE_NINJA_REQUEST_OPTIONS);
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

      // Fallback: DB?먯꽌 媛??理쒓렐 ?곗씠??媛?몄삤湲?
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
          fallback: true, // ?대씪?댁뼵?몄뿉??fallback ?щ? ?뺤씤 媛??
        };

        // 硫붾え由?罹먯떆?먮룄 ???(?ㅼ쓬 ?붿껌 ??鍮좊Ⅸ ?묐떟)
        cachedData = responseData;
        cachedTimestamp = now;

        return Response.json(responseData);
      }

      // Fallback???놁쑝硫??먮윭 諛섑솚
      throw fetchError;
    }

    // ?꾩슂???곗씠?곕쭔 異붿텧 (紐⑤뱺 移대뱶 ?ы븿)
    const cards = cardData.lines.map((card) => ({
      id: card.id,
      name: card.id
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "), // kebab-case瑜?Title Case濡?蹂??
      chaosValue: Math.round(card.primaryValue),
      divineValue: Math.round((card.primaryValue / divineRate) * 10) / 10, // ?ㅼ떆媛?Divine ?쒖꽭 ?곸슜
      icon: `https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9JbnZlbnRvcnlJY29uIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/f34bf8cbb5/InventoryIcon.png`,
    }));

    // ?뺤떆 timestamp濡??ㅼ젙
    const hourTimestamp = getCurrentHourTimestamp();

    // ?묐떟 ?곗씠???앹꽦 諛?罹먯떛
    cachedData = {
      success: true,
      league: CURRENT_LEAGUE,
      timestamp: hourTimestamp,
      cards,
      divineRate,
    };
    cachedTimestamp = now;

    // ?덉뒪?좊━?????(?깃났??寃쎌슦?먮쭔, 諛깃렇?쇱슫?쒕줈 ?ㅽ뻾)
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

