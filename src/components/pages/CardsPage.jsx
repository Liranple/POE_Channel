"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
/* eslint-disable @next/next/no-img-element */
import { CARD_DATA } from "../../data/CardData";
import {
  CARD_IMAGES,
  CARD_ART_IMAGES,
  REWARD_IMAGES,
  LOCATION_IMAGES,
} from "../../data/CardImages";
import { REWARD_DATA } from "../../data/RewardData";
import DivinationCard from "../DivinationCard";
import RewardTooltip from "../RewardTooltip";
import "../../styles/CardsPage.css";

export default function CardsPage() {
  const [hoverCard, setHoverCard] = useState(null);
  const [hoverImage, setHoverImage] = useState(null);
  const [hoverReward, setHoverReward] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const rawMousePos = useRef({ x: 0, y: 0 });

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
    } else if (CARD_IMAGES[card.name]) {
      setHoverImage(CARD_IMAGES[card.name]);
      setHoverCard(null);
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
    } else if (REWARD_IMAGES[rewardName]) {
      setHoverImage(REWARD_IMAGES[rewardName]);
      setHoverReward(null);
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

        <div className="cards-table-container">
          <table className="cards-table">
            <thead>
              <tr>
                <th className="col-name">카드 이름</th>
                <th className="col-reward">보상</th>
                <th className="col-location">드랍처</th>
              </tr>
            </thead>
            <tbody>
              {CARD_DATA.map((card, index) => (
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
                      {card.locations.map((loc, idx) => (
                        <div key={idx} className="location-item">
                          {LOCATION_IMAGES[loc] && (
                            <img
                              src={LOCATION_IMAGES[loc]}
                              alt=""
                              className="location-icon"
                            />
                          )}
                          <span>{loc}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
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
