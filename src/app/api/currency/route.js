// Next.js API Route - POE Ninja currency + divination card prices

import { CURRENT_LEAGUE } from "@/config/league";
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

export const dynamic = "force-dynamic";

const NO_STORE_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function GET() {
  try {
    const cardUrl = `${POE_NINJA_BASE_URL}/exchange/current/overview?league=${CURRENT_LEAGUE}&type=DivinationCard`;
    const currencyUrl = `${POE_NINJA_BASE_URL}/exchange/current/overview?league=${CURRENT_LEAGUE}&type=Currency`;
    const noStoreFetchOptions = {
      headers: POE_NINJA_REQUEST_OPTIONS.headers,
      cache: "no-store",
    };

    let cardData;
    let divineRate = 160;
    let fetchSuccess = false;

    try {
      const cardResponse = await fetchWithRetry(cardUrl, noStoreFetchOptions);
      cardData = await cardResponse.json();

      try {
        const currencyResponse = await fetchWithRetry(
          currencyUrl,
          noStoreFetchOptions
        );
        const currencyData = await currencyResponse.json();
        // poe.ninja exchange API uses id "divine" (not "divine-orb")
        const divine =
          currencyData.lines?.find((c) => c.id === "divine") ||
          currencyData.lines?.find((c) => c.id === "divine-orb");
        if (typeof divine?.primaryValue === "number") {
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
          fallback: true,
        };

        return Response.json(responseData, {
          headers: NO_STORE_RESPONSE_HEADERS,
        });
      }

      throw fetchError;
    }

    const cards = cardData.lines.map((card) => ({
      id: card.id,
      name: card.id
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      chaosValue: Math.round(card.primaryValue),
      divineValue: Math.round((card.primaryValue / divineRate) * 10) / 10,
      icon: "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9JbnZlbnRvcnlJY29uIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/f34bf8cbb5/InventoryIcon.png",
    }));

    const hourTimestamp = getCurrentHourTimestamp();

    const responseData = {
      success: true,
      league: CURRENT_LEAGUE,
      timestamp: hourTimestamp,
      cards,
      divineRate,
    };

    if (fetchSuccess) {
      savePriceHistory("currency", {
        cards,
        divineRate,
        league: CURRENT_LEAGUE,
      }).catch((err) => console.error("Failed to save currency history:", err));
    }

    return Response.json(responseData, { headers: NO_STORE_RESPONSE_HEADERS });
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