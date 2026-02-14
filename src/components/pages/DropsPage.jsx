import React, { useEffect, useState } from "react";
import "../../styles/DropsPage.css";
import { FaExternalLinkAlt } from "react-icons/fa";

const EVENTS = [
  {
    id: "launch",
    title: "최후의 드루이드 Launch",
    period: { start: "2025-12-13T00:00:00", end: "2025-12-28T23:59:59" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/AtzirisRoyalCacheStash.webp",
            name: "앗지리의 왕실 은닉함 보관함",
          },
        ],
        start: "2025-12-20T19:00:00",
        end: "2025-12-25T18:59:00",
        watchingText: "Watching 3 hour",
        url: "https://www.twitch.tv/directory/category/path-of-exile-2",
      },
      {
        items: [
          {
            img: "/images/drops/BloodMoonWolfPackSkillEffect.webp",
            name: "핏빛 달 늑대 무리 스킬 이펙트",
          },
          {
            img: "/images/drops/MaskoftheVaal.webp",
            name: "바알의 가면",
          },
        ],
        start: "2025-12-13T04:00:00",
        end: "2025-12-20T18:59:00",
        watchingText: "Watching 3 hour",
        url: "https://www.twitch.tv/directory/category/path-of-exile-2",
      },
    ],
  },
  {
    id: "gameawards",
    title: "The Game Awards",
    period: { start: "2025-12-12T00:00:00", end: "2025-12-12T23:59:59" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/VerdantDruidPortal.webp",
            name: "마지의 드루이드 포탈",
          },
        ],
        start: "2025-12-12T09:00:00",
        end: "2025-12-12T13:30:00",
        watchingText: "Watching 30 minute",
        url: "https://www.twitch.tv/directory/category/the-game-awards",
      },
    ],
  },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatRemaining(ms) {
  if (ms <= 0) return "00:00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatDateOnly(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DropsPage() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="drops-page-wrapper">
      <div className="page-content">
        <h1>드롭스 정보</h1>
        <p className="page-note">
          현재 진행 중이거나 종료된 Twitch Drops 이벤트 정보를 확인해보세요.
        </p>

        <div className="events-list">
          {EVENTS.map((ev) => (
            <section className="event-block" key={ev.id}>
              <div className="event-header">
                <h2 className="event-title">{ev.title}</h2>
                <div className="event-period">
                  {formatDateOnly(ev.period.start) ===
                  formatDateOnly(ev.period.end)
                    ? formatDateOnly(ev.period.start)
                    : `${formatDateOnly(ev.period.start)} ~ ${formatDateOnly(ev.period.end)}`}
                </div>
              </div>

              <div className="event-groups">
                {ev.groups.map((g, gi) => {
                  const start = new Date(g.start);
                  const end = new Date(g.end);
                  const started = now >= start;
                  const ended = now > end;
                  const remaining = end - now;
                  const notStarted = now < start;
                  const lessThanOneDay =
                    remaining > 0 && remaining < 24 * 3600 * 1000;

                  return (
                    <a
                      key={gi}
                      className="event-button"
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="rewards-col">
                        {g.items.map((it, idx) => (
                          <div className="reward-row" key={idx}>
                            <img
                              src={it.img}
                              alt={it.name}
                              className="reward-img"
                            />
                            <div className="reward-name">{it.name}</div>
                            <div className="reward-right">
                              <div
                                className={`reward-time ${
                                  notStarted
                                    ? "muted"
                                    : ended
                                      ? "ended"
                                      : lessThanOneDay
                                        ? "urgent"
                                        : "active"
                                }`}
                              >
                                {notStarted && <span>진행 대기중</span>}
                                {!notStarted && !ended && (
                                  <span>{formatRemaining(end - now)}</span>
                                )}
                                {ended && <span>종료</span>}
                              </div>
                              <div className="reward-sub">{g.watchingText}</div>
                            </div>
                            <div className="external-icon">
                              <FaExternalLinkAlt />
                            </div>
                          </div>
                        ))}
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
