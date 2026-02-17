import React, { useEffect, useState } from "react";
import "../../styles/DropsPage.css";
import { FaExternalLinkAlt } from "react-icons/fa";
import { EVENTS } from "../../data/DropsData";
import Image from "next/image";

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
  return `${days} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
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
      <div className="page-content page-fade-in">
        <h1>드롭스 정보</h1>
        <p className="page-note">
          현재 진행 중이거나 종료된 Twitch Drops 이벤트 정보를 확인해보세요.
        </p>

        <div className="events-list stagger-fade-list">
          {EVENTS.map((ev, index) => (
            <section
              className="event-block stagger-fade-item"
              style={{ "--stagger-delay": `${Math.min(index, 10) * 0.03}s` }}
              key={ev.title}
            >
              <div className="event-header">
                <h2 className="event-title">{ev.title}</h2>
                <div className="event-period">
                  {formatDateOnly(ev.period.start) ===
                  formatDateOnly(ev.period.end)
                    ? `  ${formatDateOnly(ev.period.start)}`
                    : `  ${formatDateOnly(ev.period.start)} ~ ${formatDateOnly(ev.period.end)}`}
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
                      {g.items.length === 1 ? (
                        <div className="rewards-col rewards-col-single">
                          {g.items.map((it, idx) => (
                            <div className="reward-row" key={idx}>
                              <div className="reward-box-left">
                                <Image
                                  src={it.img}
                                  alt={it.name}
                                  className="reward-img"
                                  width={40}
                                  height={40}
                                />
                                <div className="reward-name">{it.name}</div>
                              </div>
                              <div className="reward-box-right">
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
                                    {started && !ended && (
                                      <span>{formatRemaining(end - now)}</span>
                                    )}
                                    {started && ended && <span>종료</span>}
                                  </div>
                                  {started && !ended ? (
                                    <div className="reward-sub">{`Watching ${g.watchingText}`}</div>
                                  ) : null}
                                </div>
                                <div className="external-icon">
                                  <FaExternalLinkAlt />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rewards-container">
                          <div className="rewards-col rewards-col-multi">
                            {g.items.map((it, idx) => (
                              <div className="reward-row-multi" key={idx}>
                                <div className="reward-box-left">
                                  <Image
                                    src={it.img}
                                    alt={it.name}
                                    className="reward-img"
                                    width={40}
                                    height={40}
                                  />
                                  <div className="reward-name">{it.name}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="rewards-time-box">
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
                                {started && !ended && (
                                  <span>{formatRemaining(end - now)}</span>
                                )}
                                {started && ended && <span>종료</span>}
                              </div>
                              {started && !ended ? (
                                <div className="reward-sub">{`Watching ${g.watchingText}`}</div>
                              ) : null}
                            </div>
                            <div className="external-icon">
                              <FaExternalLinkAlt />
                            </div>
                          </div>
                        </div>
                      )}
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
