import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const URL_TEST_REGEX = /^(https?:\/\/[^\s<]+|www\.[^\s<]+)$/i;
const TRAILING_PUNCTUATION_REGEX = /[.,!?;:]+$/;

function normalizeUrl(url) {
  return url.startsWith("www.") ? `https://${url}` : url;
}

function splitTrailingPunctuation(urlCandidate) {
  const cleanUrl = urlCandidate.replace(TRAILING_PUNCTUATION_REGEX, "");
  const trailingText = urlCandidate.slice(cleanUrl.length);
  return { cleanUrl, trailingText };
}

function stopLinkEventPropagation(event) {
  event.stopPropagation();
}

export function parseTextWithLinks(text, keyPrefix = "text") {
  if (typeof text !== "string") return text;

  const lines = text.split(/\r?\n/);

  return lines.map((line, lineIndex) => (
    <React.Fragment key={`${keyPrefix}-line-${lineIndex}`}>
      {line.split(URL_REGEX).map((part, partIndex) => {
        if (!URL_TEST_REGEX.test(part)) return part;

        const { cleanUrl, trailingText } = splitTrailingPunctuation(part);
        if (!cleanUrl) return part;

        return (
          <React.Fragment
            key={`${keyPrefix}-line-${lineIndex}-part-${partIndex}`}
          >
            <a
              className="discussion-link"
              href={normalizeUrl(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stopLinkEventPropagation}
              onMouseDown={stopLinkEventPropagation}
              onMouseUp={stopLinkEventPropagation}
            >
              {cleanUrl}
            </a>
            {trailingText}
          </React.Fragment>
        );
      })}
      {lineIndex < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}
