"use client";

import { useState, useRef } from "react";
import { CARD_DATA } from "../../data/CardData";
import {
  CARD_IMAGES,
  REWARD_IMAGES,
  LOCATION_IMAGES,
} from "../../data/CardImages";
import "../../styles/CardsPage.css";

export default function CardsPage() {
  const [hoverImage, setHoverImage] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e, imageUrl) => {
    if (!imageUrl) return;
    setHoverImage(imageUrl);
    updateTooltipPosition(e);
  };

  const handleMouseMove = (e) => {
    if (hoverImage) {
      updateTooltipPosition(e);
    }
  };

  const handleMouseLeave = () => {
    setHoverImage(null);
  };

  const updateTooltipPosition = (e) => {
    const x = e.clientX + 20;
    const y = e.clientY + 20;

    // 화면 밖으로 나가는 것 방지 (간단한 처리)
    // 실제로는 window.innerWidth/Height 체크 필요하지만
    // 여기서는 기본적으로 우하단에 표시

    setMousePos({ x, y });
  };

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
                      onMouseEnter={(e) =>
                        handleMouseEnter(e, CARD_IMAGES[card.name])
                      }
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {card.name}
                    </span>
                  </td>
                  <td>
                    <span
                      className="card-reward"
                      onMouseEnter={(e) =>
                        handleMouseEnter(e, REWARD_IMAGES[card.reward])
                      }
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {card.reward}
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

      {/* Hover Tooltip Image */}
      {hoverImage && (
        <img
          src={hoverImage}
          alt="Preview"
          className={`tooltip-image ${hoverImage ? "visible" : ""}`}
          style={{
            left: mousePos.x + "px",
            top: mousePos.y + "px",
          }}
        />
      )}
    </div>
  );
}
