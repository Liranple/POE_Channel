"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { NOTICES } from "../../data/notices/NoticeData";
import "../../styles/HomePage.css";

// 리그 정보
const LEAGUE_INFO = {
  name: "Keepers of the Flame",
  nameKo: "불꽃의 수호자",
  startDate: new Date("2025-11-01T04:00:00+09:00"), // 한국 시간 기준 (11월 1일 04:00)
};

// 아이템 시세 캐시
let itemsCache = { data: null, timestamp: 0, cachedAt: 0 };

export default function HomePage() {
  // 리그 경과 시간 상태
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 공지사항 모달 상태
  const [selectedNotice, setSelectedNotice] = useState(null);
  const mouseDownInsideRef = useRef(false);

  // 아이템 시세 상태
  const [items, setItems] = useState(itemsCache.data || []);
  const [itemsLoading, setItemsLoading] = useState(!itemsCache.data);
  const [itemsError, setItemsError] = useState(null);

  // Divine 아이콘 (로컬 이미지)
  const divineIcon = "/images/items/CurrencyModValues.webp";

  // ==================== 리그 경과 시간 계산 ====================
  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date();
      const diff = now.getTime() - LEAGUE_INFO.startDate.getTime();

      if (diff < 0) {
        setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsed({ days, hours, minutes, seconds });
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, []);

  // ==================== 아이템 시세 가져오기 ====================
  const fetchItems = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const cacheAge = now - itemsCache.cachedAt;
    const ONE_HOUR = 60 * 60 * 1000;

    // 캐시가 유효하면 캐시 데이터 사용
    if (!forceRefresh && itemsCache.data && cacheAge < ONE_HOUR) {
      setItems(itemsCache.data);
      setItemsLoading(false);
      return;
    }

    try {
      setItemsLoading(true);
      const response = await fetch("/api/items");
      const result = await response.json();

      if (result.success) {
        setItems(result.items);
        itemsCache = {
          data: result.items,
          timestamp: result.timestamp,
          cachedAt: now,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItemsError(err.message);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  // 정시마다 자동 갱신
  useEffect(() => {
    fetchItems();

    const getTimeUntilNextHour = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      return nextHour.getTime() - now.getTime();
    };

    const timeoutId = setTimeout(() => {
      fetchItems(true);
      const intervalId = setInterval(() => fetchItems(true), 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }, getTimeUntilNextHour());

    return () => clearTimeout(timeoutId);
  }, [fetchItems]);

  // ==================== 공지사항 모달 핸들러 ====================
  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
  };

  const handleOverlayMouseDown = (e) => {
    // 모달 영역 밖에서 mousedown이 시작되었는지 확인
    if (e.target.classList.contains("notice-modal-overlay")) {
      mouseDownInsideRef.current = false;
    } else {
      mouseDownInsideRef.current = true;
    }
  };

  const handleOverlayMouseUp = (e) => {
    // mousedown이 영역 밖에서 시작되고, mouseup도 영역 밖이면 닫기
    if (
      e.target.classList.contains("notice-modal-overlay") &&
      !mouseDownInsideRef.current
    ) {
      setSelectedNotice(null);
    }
  };

  // 최근 3개 공지사항만 표시
  const recentNotices = NOTICES.slice(0, 3);

  // 리그 시작 날짜 포맷
  const formatStartDate = (date) => {
    return date
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\. /g, "-")
      .replace(".", "")
      .replace(" ", " ");
  };

  return (
    <div className="home-page-wrapper">
      {/* ==================== 리그 타이머 ==================== */}
      <section className="league-timer-section">
        <h1 className="league-name">{LEAGUE_INFO.name}</h1>
        <p className="league-start-info">
          {LEAGUE_INFO.nameKo} · 시작: {formatStartDate(LEAGUE_INFO.startDate)}
        </p>
        <div className="league-elapsed">
          <div className="time-block">
            <span className="time-value">
              {String(elapsed.days).padStart(2, "0")}
            </span>
            <span className="time-label">Days</span>
          </div>
          <span className="time-separator">:</span>
          <div className="time-block">
            <span className="time-value">
              {String(elapsed.hours).padStart(2, "0")}
            </span>
            <span className="time-label">Hours</span>
          </div>
          <span className="time-separator">:</span>
          <div className="time-block">
            <span className="time-value">
              {String(elapsed.minutes).padStart(2, "0")}
            </span>
            <span className="time-label">Minutes</span>
          </div>
          <span className="time-separator">:</span>
          <div className="time-block">
            <span className="time-value">
              {String(elapsed.seconds).padStart(2, "0")}
            </span>
            <span className="time-label">Seconds</span>
          </div>
        </div>
      </section>

      {/* ==================== 공지사항 ==================== */}
      <section className="notices-section">
        <div className="section-header">
          <h2 className="section-title">공지사항</h2>
        </div>
        <div className="notices-list">
          {recentNotices.length > 0 ? (
            recentNotices.map((notice) => (
              <div
                key={notice.id}
                className="notice-item"
                onClick={() => handleNoticeClick(notice)}
              >
                <span className="notice-title">{notice.title}</span>
                <span className="notice-date">{notice.date}</span>
              </div>
            ))
          ) : (
            <div className="no-notices">등록된 공지사항이 없습니다</div>
          )}
        </div>
      </section>

      {/* ==================== 아이템 시세 ==================== */}
      <section className="items-section">
        <div className="section-header">
          <h2 className="section-title">주요 아이템 시세</h2>
        </div>

        {itemsLoading ? (
          <div className="items-loading">로딩 중...</div>
        ) : itemsError ? (
          <div className="items-error">⚠️ 시세 정보를 불러오지 못했습니다</div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.name} className="item-widget">
                <div className="item-icon-wrapper">
                  <img
                    src={`/images/items/${item.icon}`}
                    alt={item.nameKo}
                    className="item-icon"
                  />
                </div>
                <div className="item-info">
                  <div className="item-name">{item.nameKo}</div>
                  <div className="item-price">
                    {item.divineValue >= 1
                      ? item.divineValue.toFixed(1)
                      : `${Math.round(item.chaosValue)}c`}
                    {item.divineValue >= 1 && (
                      <img src={divineIcon} alt="div" className="divine-icon" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== 공지사항 모달 ==================== */}
      {selectedNotice && (
        <div
          className="notice-modal-overlay"
          onMouseDown={handleOverlayMouseDown}
          onMouseUp={handleOverlayMouseUp}
        >
          <div className="notice-modal">
            <div className="notice-modal-header">
              <div>
                <h3 className="notice-modal-title">{selectedNotice.title}</h3>
                <span className="notice-modal-date">{selectedNotice.date}</span>
              </div>
            </div>
            <div className="notice-modal-content">
              <div className="notice-body">{selectedNotice.content}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
