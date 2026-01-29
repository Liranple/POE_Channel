"use client";
import React, { useState, useEffect } from "react";

// 이벤트 표시 토글 (웹에서 조작하지 않습니다)
// 파일을 열어 아래 값을 true 또는 false로 변경하면
// 메인 페이지에서 이벤트 레이아웃을 표시/미표시 할 수 있습니다.
// 예: const ENABLE_EVENT_DISPLAY = true
const ENABLE_EVENT_DISPLAY = true; // <- 여기 true/false 변경

const EVENT = {
  name: "Legacy of Phrecia",
  nameKo: "프레시아의 유산",
  start: new Date("2026-01-30T06:00:00"),
  end: new Date("2026-02-20T06:00:00"),
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDate(date) {
  // Return format: YYYY-MM-DD  HH:MM (two spaces between date and time)
  const Y = date.getFullYear();
  const M = pad2(date.getMonth() + 1);
  const D = pad2(date.getDate());
  const h = pad2(date.getHours());
  const m = pad2(date.getMinutes());
  return `${Y}-${M}-${D}  ${h}:${m}`;
}

export default function EventLeague() {
  // 훅은 항상 같은 순서로 호출되어야 합니다.
  // 아래 훅들은 조건문 전에 호출되며, effect 내부에서 ENABLE_EVENT_DISPLAY를 검사합니다.
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!ENABLE_EVENT_DISPLAY) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 파일 상단의 `ENABLE_EVENT_DISPLAY` 값으로만 표시 제어
  if (!ENABLE_EVENT_DISPLAY) return null;

  const start = EVENT.start;
  const end = EVENT.end;

  let status = "upcoming";
  if (now >= start && now <= end) status = "live";
  if (now > end) status = "ended";

  const diff =
    status === "upcoming"
      ? start.getTime() - now.getTime()
      : end.getTime() - now.getTime();

  const positiveDiff = Math.max(0, diff);
  const days = Math.floor(positiveDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (positiveDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((positiveDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((positiveDiff % (1000 * 60)) / 1000);

  return (
    <section
      className="league-timer-section event-league-section"
      style={{ position: "relative" }}
    >
      <span
        style={{
          position: "absolute",
          left: 18,
          top: 16,
          fontSize: 16,
          opacity: 0.85,
        }}
      >
        Event
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 className="league-name">{EVENT.name}</h1>
          <p className="league-start-info">
            {EVENT.nameKo} · 시작 : {formatDate(start)}
          </p>
        </div>
      </div>

      <div className="league-elapsed" style={{ justifyContent: "center" }}>
        {status === "ended" ? (
          <div style={{ padding: 12 }}>
            이벤트가 종료되었습니다 ({formatDate(end)})
          </div>
        ) : (
          <>
            <div className="time-block">
              <span className="time-value">
                {String(days).padStart(2, "0")}
              </span>
              <span className="time-label">Days</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-block">
              <span className="time-value">
                {String(hours).padStart(2, "0")}
              </span>
              <span className="time-label">Hours</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-block">
              <span className="time-value">
                {String(minutes).padStart(2, "0")}
              </span>
              <span className="time-label">Minutes</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-block">
              <span className="time-value">
                {String(seconds).padStart(2, "0")}
              </span>
              <span className="time-label">Seconds</span>
            </div>
            {status === "live" && (
              <div style={{ marginTop: 8, fontSize: 13 }}>이벤트 진행 중</div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
