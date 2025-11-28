import React, { useState, useEffect, useMemo } from "react";
import { REWARD_DATA } from "../data/RewardData";
import "../styles/RewardTooltip.css";

// Helper to parse custom tags - moved outside to prevent recreation
const ParsedText = React.memo(({ text }) => {
  if (typeof text !== "string") return text;
  const parts = text.split(
    /(<(?:grey|white|unique|blue|red)>[\s\S]*?<\/(?:grey|white|unique|blue|red)>|<sep>|\n)/g
  );
  return parts.map((part, index) => {
    if (part === "\n") return <br key={index} />;
    if (part === "<sep>")
      return <div key={index} className="reward-tooltip-separator"></div>;
    const match = part.match(/<(grey|white|unique|blue|red)>([\s\S]*?)<\/\1>/);
    if (match) {
      const [_, colorType, content] = match;
      const colors = {
        grey: "#7f7f7f",
        white: "#fff",
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
});

export default function RewardTooltip({ rewardName }) {
  const rawData = REWARD_DATA[rewardName];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (Array.isArray(rawData) && rawData.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % rawData.length);
      }, 2000); // Cycle every 2 seconds
      return () => clearInterval(interval);
    }
  }, [rawData]);

  if (!rawData) return null;

  const data = Array.isArray(rawData) ? rawData[currentIndex] : rawData;

  const {
    name,
    baseType,
    type,
    tags,
    properties,
    description,
    explanation,
    instruction,
    icon,
    iconSize,
  } = data;

  return (
    <div className={`reward-tooltip-container ${type}`}>
      <div className={`reward-tooltip-header ${type}`}>
        <div className="reward-tooltip-header-name">{name}</div>
        {baseType && (
          <div className="reward-tooltip-header-base">{baseType}</div>
        )}
      </div>
      <div className="reward-tooltip-content">
        {tags && tags.length > 0 && (
          <div className="reward-tooltip-tags">{tags.join(", ")}</div>
        )}

        {properties &&
          properties.map((prop, idx) => {
            if (prop === "---") {
              return <div key={idx} className="reward-tooltip-separator"></div>;
            }
            return (
              <div key={idx} className="reward-tooltip-properties">
                <ParsedText text={prop} />
              </div>
            );
          })}

        {/* Separator if needed */}
        {(description || explanation) && (
          <div className="reward-tooltip-separator"></div>
        )}

        {description && (
          <div className="reward-tooltip-description">
            <ParsedText text={description} />
          </div>
        )}

        {description && explanation && (
          <div className="reward-tooltip-separator"></div>
        )}

        {explanation && (
          <div className="reward-tooltip-explanation">
            <ParsedText text={explanation} />
          </div>
        )}

        {(description || explanation) && instruction && (
          <div className="reward-tooltip-separator"></div>
        )}

        {instruction && (
          <div className="reward-tooltip-instruction">
            <ParsedText text={instruction} />
          </div>
        )}

        {icon && (
          <img
            key={icon}
            src={icon}
            alt={name}
            className="reward-tooltip-icon"
            style={iconSize ? { maxWidth: iconSize } : {}}
          />
        )}
      </div>
    </div>
  );
}
