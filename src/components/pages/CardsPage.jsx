"use client";

import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from "react";
/* eslint-disable @next/next/no-img-element */
import { CARD_DATA } from "../../data/CardData";
import { CARD_ART_IMAGES, LOCATION_IMAGES } from "../../data/CardImages";
import { REWARD_DATA } from "../../data/RewardData";
import DivinationCard from "../DivinationCard";
import RewardTooltip from "../RewardTooltip";
import "../../styles/CardsPage.css";

// 한글 카드 이름 -> 영어 ID 매핑 (kebab-case)
const CARD_NAME_TO_ID = {
  "거울의 집": "house-of-mirrors",
  약제사: "the-apothecary",
  짝사랑: "unrequited-love",
  천벌: "damnation",
  "근원을 알 수 없는 화염": "fire-of-unknown-origin",
  "헌신의 대가": "the-price-of-devotion",
  "아버지의 사랑": "fathers-love",
  역사: "history",
  "실성한 고양이": "the-insane-cat",
  의사: "the-doctor",
  악마: "the-demon",
  불멸자: "the-immortal",
  마귀: "the-fiend",
  "형제의 선물": "brothers-gift",
  "루나리스의 자손": "the-progeny-of-lunaris",
  "신성한 정의": "divine-justice",
  "형제가 보인다": "i-see-brothers",
  "끝없는 어둠": "the-endless-darkness",
  사기꾼: "the-cheater",
  "한 수 밀림": "outfoxed",
  "7년 간의 불운": "seven-years-bad-luck",
  "얼음을 가르는 사랑": "love-through-ice",
  "토끼 발": "the-rabbits-foot",
  간호사: "the-nurse",
  "부와 권력": "wealth-and-power",
  "숨막히는 죄책감": "choking-guilt",
  "마지막 저항": "the-last-one-standing",
  "외로운 전사": "lonely-warrior",
  "마지막 한 번의 기회": "one-last-score",
  세피로트: "the-sephirot",
  호수: "the-lake",
  "빛나는 발견물": "luminous-trove",
  "훼손된 미덕": "desecrated-virtue",
};

// 전역 캐시 (컴포넌트 외부에 선언하여 페이지 이동 후에도 유지)
let cardsCache = { data: null, timestamp: 0, cachedAt: 0 };

// 이미지 프리로드 캐시 (한 번만 실행)
let imagesPreloaded = false;

// 모든 보상/카드 이미지를 미리 로드하는 함수
const preloadRewardImages = () => {
  if (imagesPreloaded) return;
  imagesPreloaded = true;

  const imageUrls = new Set();

  // REWARD_DATA에서 모든 icon URL 수집
  Object.values(REWARD_DATA).forEach((data) => {
    if (Array.isArray(data)) {
      // 배열인 경우 (예: SUBLIME_VISION_DATA)
      data.forEach((item) => {
        if (item?.icon) imageUrls.add(item.icon);
      });
    } else if (data?.icon) {
      imageUrls.add(data.icon);
    }
  });

  // CARD_ART_IMAGES에서 카드 삽화 URL 수집
  Object.values(CARD_ART_IMAGES).forEach((url) => {
    if (url) imageUrls.add(url);
  });

  // 이미지 미리 로드 (우선순위: low로 설정하여 메인 콘텐츠 로딩 방해 방지)
  imageUrls.forEach((url) => {
    const img = new Image();
    img.loading = "eager";
    img.src = url;
  });
};

export default function CardsPage() {
  const [hoverCard, setHoverCard] = useState(null);
  const [hoverImage, setHoverImage] = useState(null);
  const [hoverReward, setHoverReward] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const rawMousePos = useRef({ x: 0, y: 0 });

  // 시세 관련 상태
  const [priceData, setPriceData] = useState(cardsCache.data || {});
  const [priceLoading, setPriceLoading] = useState(!cardsCache.data);
  const [lastUpdated, setLastUpdated] = useState(
    cardsCache.timestamp ? new Date(cardsCache.timestamp) : null
  );

  // 시세 데이터 가져오기 (1시간 캐싱)
  const fetchPriceData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const cacheAge = now - cardsCache.cachedAt;
    const ONE_HOUR = 60 * 60 * 1000;

    // 캐시가 유효하면 캐시 데이터 사용
    if (!forceRefresh && cardsCache.data && cacheAge < ONE_HOUR) {
      setPriceData(cardsCache.data);
      setLastUpdated(new Date(cardsCache.timestamp));
      setPriceLoading(false);
      return;
    }

    try {
      setPriceLoading(true);
      const response = await fetch("/api/currency");
      const result = await response.json();

      if (result.success) {
        const priceMap = {};
        result.cards.forEach((card) => {
          priceMap[card.id] = card.divineValue;
        });
        setPriceData(priceMap);
        if (result.timestamp) {
          setLastUpdated(new Date(result.timestamp));
        }
        // 전역 캐시 저장 (API에서 받은 정시 timestamp 사용)
        cardsCache = {
          data: priceMap,
          timestamp: result.timestamp,
          cachedAt: now,
        };
      }
    } catch (err) {
      console.error("Failed to fetch price data:", err);
    } finally {
      setPriceLoading(false);
    }
  }, []);

  // 매 정시마다 자동 갱신
  useEffect(() => {
    // 보상 이미지 프리로드 (한 번만 실행)
    preloadRewardImages();

    // 초기 로드
    fetchPriceData();

    // 다음 정시까지 남은 시간 계산
    const getTimeUntilNextHour = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      return nextHour.getTime() - now.getTime();
    };

    // 첫 정시에 실행 후, 이후 1시간마다 반복
    const timeoutId = setTimeout(() => {
      fetchPriceData(true); // 강제 새로고침
      // 정시 이후 1시간마다 반복
      const intervalId = setInterval(
        () => fetchPriceData(true),
        60 * 60 * 1000
      );
      return () => clearInterval(intervalId);
    }, getTimeUntilNextHour());

    return () => clearTimeout(timeoutId);
  }, [fetchPriceData]);

  // 카드의 Divine 가격 가져오기 (소숫점 1자리, 항상 표시)
  const getCardPrice = useCallback(
    (cardName) => {
      const cardId = CARD_NAME_TO_ID[cardName];
      if (!cardId) return null;
      const price = priceData[cardId];
      if (price === undefined) return null;
      return (Math.round(price * 10) / 10).toFixed(1); // 소숫점 1자리 항상 표시 (1 -> "1.0")
    },
    [priceData]
  );

  // 시세순으로 정렬된 카드 데이터
  const sortedCardData = useMemo(() => {
    return [...CARD_DATA].sort((a, b) => {
      const priceA = getCardPrice(a.name) ?? -1;
      const priceB = getCardPrice(b.name) ?? -1;
      return priceB - priceA; // 높은 가격순
    });
  }, [getCardPrice]);

  // Helper to parse custom tags
  const parseRewardText = (text) => {
    if (typeof text !== "string") return text;
    const parts = text.split(
      /(<(?:grey|white|unique|blue|red)>[\s\S]*?<\/(?:grey|white|unique|blue|red)>|\n)/g
    );
    return parts.map((part, index) => {
      if (part === "\n") return <br key={index} />;
      const match = part.match(
        /<(grey|white|unique|blue|red)>([\s\S]*?)<\/\1>/
      );
      if (match) {
        const [_, colorType, content] = match;
        const colors = {
          grey: "#7f7f7f",
          white: "#c8c8c8",
          unique: "#af6025",
          blue: "#8888ff",
          red: "#d20000",
        };
        const contentParts = content.split("\n").map((line, i, arr) => (
          <React.Fragment key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </React.Fragment>
        ));
        return (
          <span key={index} style={{ color: colors[colorType] }}>
            {contentParts}
          </span>
        );
      }
      return part;
    });
  };

  const getRewardClass = (rewardText) => {
    if (!rewardText) return "currency";

    // Strip tags for classification
    const cleanText = rewardText.replace(/<[^>]+>/g, "");

    if (
      cleanText.includes("마법사의 피") ||
      cleanText.includes("헤드헌터") ||
      cleanText.includes("니미스") ||
      cleanText.includes("원형의 성서") ||
      cleanText.includes("숭고한 환영") ||
      cleanText.includes("죽어가는 해") ||
      cleanText.includes("장대한 파장") ||
      cleanText.includes("공허의 탄생") ||
      cleanText.includes("기이한 본능") ||
      cleanText.includes("교살의 손아귀") ||
      cleanText.includes("포기") ||
      cleanText.includes("운명의 저항") ||
      cleanText.includes("목소리")
    ) {
      return "unique";
    } else if (cleanText.includes("젬")) {
      return "gem";
    } else if (cleanText.includes("거울의 집") || cleanText.includes("의사")) {
      return "card";
    } else if (cleanText.includes("실험적 장신구")) {
      return "base";
    }
    return "currency";
  };

  const handleCardMouseEnter = (e, card) => {
    rawMousePos.current = { x: e.clientX, y: e.clientY };
    if (CARD_ART_IMAGES[card.name]) {
      setHoverCard(card);
      setHoverImage(null);
      setHoverReward(null);
      updatePosition();
    }
  };

  const handleRewardMouseEnter = (e, rewardName) => {
    rawMousePos.current = { x: e.clientX, y: e.clientY };
    // Special handling for specific card rewards to show card tooltip
    if (rewardName === "거울의 집" || rewardName === "의사") {
      const targetCard = CARD_DATA.find((c) => c.name === rewardName);
      if (targetCard) {
        setHoverCard(targetCard);
        setHoverReward(null);
        setHoverImage(null);
        updatePosition();
        return;
      }
    }

    if (REWARD_DATA[rewardName]) {
      setHoverReward(rewardName);
      setHoverImage(null);
      setHoverCard(null);
      updatePosition();
    }
  };

  const handleImageMouseEnter = (e, imageUrl) => {
    if (!imageUrl) return;
    rawMousePos.current = { x: e.clientX, y: e.clientY };
    setHoverImage(imageUrl);
    setHoverCard(null); // Clear card tooltip
    setHoverReward(null);
    updatePosition();
  };

  const handleMouseMove = (e) => {
    rawMousePos.current = { x: e.clientX, y: e.clientY };
    if (hoverCard || hoverImage || hoverReward) {
      updatePosition();
    }
  };

  const handleMouseLeave = () => {
    setHoverCard(null);
    setHoverImage(null);
    setHoverReward(null);
  };

  const updatePosition = () => {
    const { x: clientX, y: clientY } = rawMousePos.current;
    const x = clientX + 20;
    const windowHeight = window.innerHeight;

    let y = clientY + 20;

    if (tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.offsetHeight;
      // DivinationCard has scale 0.8
      const scale = hoverCard ? 0.8 : 1;
      const effectiveHeight = tooltipHeight * scale;
      const padding = 40;

      // 60% 지점 기준 (사용자 요청)
      const isBottom = clientY > windowHeight * 0.6;

      if (isBottom) {
        y = clientY - effectiveHeight - 10;
      } else {
        y = clientY + 20;
      }

      // 화면 아래로 벗어나지 않도록 위치 조정
      const maxTop = windowHeight - effectiveHeight - padding;
      if (y > maxTop) {
        y = maxTop;
      }

      // 화면 위로 벗어나지 않도록 위치 조정
      if (y < padding) {
        y = padding;
      }
    }

    setMousePos({ x, y });
  };

  useLayoutEffect(() => {
    if (hoverCard || hoverReward || hoverImage) {
      updatePosition();
    }
  }, [hoverCard, hoverReward, hoverImage]);

  return (
    <div className="cards-page-wrapper">
      <div className="page-content">
        <h1>카드 드랍처</h1>
        <p className="price-update-notice">
          ※ 시세는 매 정시마다 자동 갱신됩니다
          {lastUpdated && (
            <>
              <br />
              (마지막 업데이트: {lastUpdated.toLocaleTimeString("ko-KR")})
            </>
          )}
        </p>

        <div className="cards-table-container">
          <table className="cards-table">
            <thead>
              <tr>
                <th className="col-name">카드 이름</th>
                <th className="col-price">시세</th>
                <th className="col-reward">보상</th>
                <th className="col-location">드랍처</th>
              </tr>
            </thead>
            <tbody>
              {sortedCardData.map((card, index) => {
                const price = getCardPrice(card.name);
                return (
                  <tr key={index}>
                    <td>
                      <span
                        className="card-name"
                        onMouseEnter={(e) => handleCardMouseEnter(e, card)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      >
                        {card.name}
                      </span>
                    </td>
                    <td className="price-cell">
                      {priceLoading ? (
                        <span className="price-loading">...</span>
                      ) : price !== null ? (
                        <span className="divine-price">
                          {price}
                          <img
                            src="/images/items/CurrencyModValues.webp"
                            alt="Divine"
                            className="divine-icon"
                          />
                        </span>
                      ) : (
                        <span className="no-price">-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`card-reward ${getRewardClass(card.reward)}`}
                        onMouseEnter={(e) =>
                          handleRewardMouseEnter(e, card.reward)
                        }
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      >
                        {parseRewardText(card.reward)}
                      </span>
                    </td>
                    <td>
                      <div className="location-list">
                        {card.locations.map((loc, idx) => {
                          const locImage = LOCATION_IMAGES[loc];
                          return (
                            <div key={idx} className="location-item">
                              {locImage &&
                                (typeof locImage === "string" ? (
                                  <img
                                    src={locImage}
                                    alt=""
                                    className="location-icon"
                                  />
                                ) : (
                                  <div className="location-icon-layered">
                                    <img
                                      src="/images/items/Base23.webp"
                                      alt=""
                                      className="location-base"
                                    />
                                    {locImage.color ? (
                                      <div
                                        className="location-overlay"
                                        style={{
                                          backgroundColor: locImage.color,
                                          maskImage: `url(${locImage.overlay})`,
                                          WebkitMaskImage: `url(${locImage.overlay})`,
                                          maskSize: "contain",
                                          WebkitMaskSize: "contain",
                                          maskRepeat: "no-repeat",
                                          WebkitMaskRepeat: "no-repeat",
                                          maskPosition: "center",
                                          WebkitMaskPosition: "center",
                                        }}
                                      />
                                    ) : (
                                      <img
                                        src={locImage.overlay}
                                        alt=""
                                        className="location-overlay"
                                      />
                                    )}
                                  </div>
                                ))}
                              <span>{loc}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hover Tooltip: Divination Card Component */}
      {hoverCard && (
        <div
          ref={tooltipRef}
          className="tooltip-container visible"
          style={{
            position: "fixed",
            left: mousePos.x + "px",
            top: mousePos.y + "px",
            zIndex: 1000,
            pointerEvents: "none",
            transform: "scale(0.8)", // Increased from 0.7 by ~20%
            transformOrigin: "top left",
            maxHeight: "80vh",
          }}
        >
          <DivinationCard
            cardData={hoverCard}
            artUrl={CARD_ART_IMAGES[hoverCard.name]}
          />
        </div>
      )}

      {/* Hover Tooltip: Reward Tooltip */}
      {hoverReward && (
        <div
          ref={tooltipRef}
          className="tooltip-container visible"
          style={{
            position: "fixed",
            left: mousePos.x + "px",
            top: mousePos.y + "px",
            zIndex: 1000,
            pointerEvents: "none",
            maxHeight: "80vh",
          }}
        >
          <RewardTooltip rewardName={hoverReward} />
        </div>
      )}

      {/* Hover Tooltip: Simple Image */}
      {hoverImage && (
        <img
          ref={tooltipRef}
          src={hoverImage}
          alt="Preview"
          className={`tooltip-image ${hoverImage ? "visible" : ""}`}
          style={{
            left: mousePos.x + "px",
            top: mousePos.y + "px",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
}
