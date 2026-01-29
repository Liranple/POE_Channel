import React from "react";
import "../../styles/SitesPage.css";
import { FaExternalLinkAlt } from "react-icons/fa";

const SITES = [
  {
    label: "POE Ninja",
    url: "https://poe.ninja",
    description: "시세와 리그 통계",
    icon: "https://www.google.com/s2/favicons?sz=64&domain_url=poe.ninja",
  },
  {
    label: "Path of Exile",
    url: "https://poe.game.daum.net/",
    description: "한국 공식 사이트",
    icon: "https://www.google.com/s2/favicons?sz=64&domain_url=pathofexile.com",
  },
  {
    label: "POE Trade",
    url: "https://poe.game.daum.net/trade",
    description: "거래 검색",
    icon: "/images/ui/trade.png",
  },
  {
    label: "PoE DB",
    url: "https://poedb.tw",
    description: "아이템 / 빌드 정보",
    icon: "/images/ui/POEDB.png",
  },
  {
    label: "Craft of Exile",
    url: "https://www.craftofexile.com/?cl=kr",
    description: "아이템 제작 시뮬레이터",
    icon: "https://www.google.com/s2/favicons?sz=64&domain_url=craftofexile.com",
  },
  {
    label: "FilterBlade",
    url: "https://www.filterblade.xyz/?game=Poe1",
    description: "아이템 필터 생성 / 편집",
    icon: "https://www.google.com/s2/favicons?sz=64&domain_url=filterblade.xyz",
  },
  {
    label: "POE LAB",
    url: "https://www.poelab.com/",
    description: "미궁 지도",
    icon: "/images/ui/Labyrinth.webp",
  },
  {
    label: "Vorici Chromatic Calculator",
    url: "https://siveran.github.io/calc.html",
    description: "오프컬러 작업 효율 계산",
    icon: "/images/ui/CurrencyRerollSocketColours.webp",
  },
  {
    label: "Timeless Calculator",
    url: "https://vilsol.github.io/timeless-jewels",
    description: "군단주얼 위치 탐색",
    icon: "https://vilsol.github.io/timeless-jewels/favicon.png",
  },
  {
    label: "Path of Exile Wiki",
    url: "https://www.poewiki.net/wiki/Path_of_Exile_Wiki",
    description: "위키",
    icon: "https://www.google.com/s2/favicons?sz=64&domain_url=https://www.poewiki.net/wiki/Path_of_Exile_Wiki",
  },
];

export default function SitesPage() {
  return (
    <div className="sites-page-wrapper">
      <div className="page-content">
        <h1>주요 사이트</h1>
        <p className="page-note">
          자주 참고하는 외부 사이트입니다. 항목을 클릭하면 새 탭으로 열립니다.
        </p>

        <ul className="sites-list">
          {SITES.map((s) => (
            <li key={s.url} className="site-item">
              <a
                className="site-link"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="site-icon-wrap">
                  <img
                    className="site-icon"
                    src={s.icon}
                    alt={`${s.label} favicon`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="%23f3f3f3"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23777">?</text></svg>';
                    }}
                  />
                </div>
                <div className="site-info">
                  <div className="site-label">{s.label}</div>
                  <div className="site-description">{s.description}</div>
                </div>
                <FaExternalLinkAlt className="external-icon" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
