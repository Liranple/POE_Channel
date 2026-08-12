import React from "react";

const TAG_COLORS = {
  grey: "#7f7f7f",
  white: "#c8c8c8",
  unique: "#af6025",
  blue: "#8888ff",
  red: "#d20000",
  foulborn: "#de2277",
  yellow: "#eBc850",
  green: "#1BA29B",
};

const TAG_BLOCK_REGEX =
  /(<(?:grey|gray|white|unique|blue|red|foulborn|purple|yellow|green)>[\s\S]*?<\/(?:grey|gray|white|unique|blue|red|foulborn|purple|yellow|green)>|\n)/g;
const TAG_CONTENT_REGEX =
  /<(grey|gray|white|unique|blue|red|foulborn|purple|yellow|green)>([\s\S]*?)<\/\1>/;

export function parseColoredTaggedText(text) {
  if (typeof text !== "string") return text;

  const parts = text.split(TAG_BLOCK_REGEX);
  return parts.map((part, index) => {
    if (part === "\n") return <br key={index} />;

    const match = part.match(TAG_CONTENT_REGEX);
    if (!match) return part;

    const [, colorType, content] = match;
    const contentParts = content.split("\n").map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));

    return (
      <span key={index} style={{ color: TAG_COLORS[colorType] }}>
        {contentParts}
      </span>
    );
  });
}
