import React, { useRef, useLayoutEffect } from "react";
import "../styles/DivinationCard.css";

export default function DivinationCard({ cardData, artUrl }) {
  if (!cardData) return null;

  const { name, reward, cardReward, stackSize, flavorText } = cardData;
  const displayReward = cardReward || reward;
  const flavorRef = useRef(null);

  // Helper to parse custom tags in reward string
  const parseRewardText = (text) => {
    if (typeof text !== "string") return text;

    // Split by tags <grey>, <white>, <unique>, <blue>, <red> (allowing newlines inside) or newlines outside
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
        // Handle newlines inside the tag content
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

  useLayoutEffect(() => {
    const element = flavorRef.current;
    if (!element) return;

    // Reset font size to default to measure correctly
    let size = 16;
    element.style.fontSize = `${size}px`;

    // Height available for text = Total Height (160) - Vertical Padding (20)
    const maxHeight = 120;

    // Reduce font size until it fits
    while (element.scrollHeight > maxHeight && size > 11) {
      size -= 0.5;
      element.style.fontSize = `${size}px`;
    }
  }, [flavorText]);

  // Determine reward type color
  let rewardClass = "currency"; // Default to currency (includes Mirror of Kalandra)

  // Extract plain text for classification
  let rewardText = "";
  if (typeof displayReward === "string") {
    // Remove tags for checking content
    rewardText = displayReward.replace(/<(?:.|\n)*?>/gm, "");
  } else if (Array.isArray(displayReward)) {
    rewardText = displayReward.map((part) => part.text).join("");
  } else {
    rewardText = reward; // Fallback
  }

  if (
    rewardText.includes("마법사의 피") ||
    rewardText.includes("헤드헌터") ||
    rewardText.includes("니미스") ||
    rewardText.includes("원형의 성서") ||
    rewardText.includes("숭고한 환영") ||
    rewardText.includes("죽어가는 해") ||
    rewardText.includes("장대한 파장") ||
    rewardText.includes("공허의 탄생") ||
    rewardText.includes("기이한 본능") ||
    rewardText.includes("교살의 손아귀") ||
    rewardText.includes("포기") ||
    rewardText.includes("운명의 저항") ||
    rewardText.includes("목소리")
  ) {
    rewardClass = "unique";
  } else if (rewardText.includes("젬")) {
    rewardClass = "gem";
  } else if (rewardText.includes("거울의 집") || rewardText.includes("의사")) {
    rewardClass = "card";
  } else if (rewardText.includes("실험적 장신구")) {
    // Example heuristic for base items, adjust as needed
    rewardClass = "base";
  }

  return (
    <div className="divination-card-wrapper">
      {/* Frame */}
      <img
        src="https://cdn.poedb.tw/image/item/popup/divination-card.webp"
        alt="Card Frame"
        className="divination-card-frame"
      />

      {/* Art */}
      {artUrl && (
        <img src={artUrl} alt={name} className="divination-card-art" />
      )}

      {/* Header */}
      <div className="divination-card-header">{name}</div>

      {/* Stack Size */}
      {stackSize && <div className="divination-card-stack">{stackSize}</div>}

      {/* Reward Area */}
      <div className="divination-card-reward-area">
        <div className={`divination-card-reward ${rewardClass}`}>
          {Array.isArray(displayReward)
            ? displayReward.map((part, index) => (
                <span key={index} className={part.className} style={part.style}>
                  {part.text}
                </span>
              ))
            : parseRewardText(displayReward)}
        </div>
      </div>

      {/* Separator */}
      <div className="divination-card-separator"></div>

      {/* Flavor Text Area */}
      <div className="divination-card-flavor-area">
        <div
          className="divination-card-flavor"
          ref={flavorRef}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {Array.isArray(flavorText)
            ? flavorText.map((line, index) => (
                <span key={index} style={{ color: line.color }}>
                  {line.text}
                </span>
              ))
            : flavorText}
        </div>
      </div>
    </div>
  );
}
