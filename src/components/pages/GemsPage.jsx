"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useCallback } from "react";
import "../../styles/GemsPage.css";

// 전역 캐시 (컴포넌트 외부에 선언하여 페이지 이동 후에도 유지)
let gemsCache = { data: null, timestamp: 0, cachedAt: 0 };

export default function GemsPage() {
  const [gems, setGems] = useState(gemsCache.data || []);
  const [loading, setLoading] = useState(!gemsCache.data);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(
    gemsCache.timestamp ? new Date(gemsCache.timestamp) : null
  );

  // 시세 데이터 가져오기 (1시간 캐싱)
  const fetchGems = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const cacheAge = now - gemsCache.cachedAt;
    const ONE_HOUR = 60 * 60 * 1000;

    // 캐시가 유효하면 캐시 데이터 사용
    if (!forceRefresh && gemsCache.data && cacheAge < ONE_HOUR) {
      setGems(gemsCache.data);
      setLastUpdated(new Date(gemsCache.timestamp));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/gems");
      const result = await response.json();

      if (result.success) {
        setGems(result.gems);
        setLastUpdated(new Date(result.timestamp));
        // 전역 캐시 저장 (API에서 받은 정시 timestamp 사용)
        gemsCache = {
          data: result.gems,
          timestamp: result.timestamp,
          cachedAt: now,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Failed to fetch gems:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 매 정시마다 자동 갱신
  useEffect(() => {
    // 초기 로드
    fetchGems();

    // 다음 정시까지 남은 시간 계산
    const getTimeUntilNextHour = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      return nextHour.getTime() - now.getTime();
    };

    // 첫 정시에 실행 후, 이후 1시간마다 반복
    const timeoutId = setTimeout(() => {
      fetchGems(true); // 강제 새로고침
      const intervalId = setInterval(() => fetchGems(true), 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }, getTimeUntilNextHour());

    return () => clearTimeout(timeoutId);
  }, [fetchGems]);

  const chaosIcon =
    "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png";

  // Act별 로마숫자
  const actLabels = { 1: "Ⅰ", 2: "Ⅱ", 3: "Ⅲ", 4: "Ⅳ" };

  return (
    <div className="gems-page-wrapper">
      <div className="page-content">
        <h1>보조 젬 시세</h1>
        <p className="price-update-notice">
          ※ 시세는 매 정시마다 자동 갱신됩니다
          {lastUpdated && (
            <>
              <br />
              (마지막 업데이트: {lastUpdated.toLocaleTimeString("ko-KR")})
            </>
          )}
        </p>

        {error && (
          <div className="gems-error">
            ⚠️ 데이터를 불러오는데 실패했습니다: {error}
          </div>
        )}

        <div className="gems-table-container">
          <table className="gems-table">
            <thead>
              <tr>
                <th className="col-icon"></th>
                <th className="col-name">젬 이름</th>
                <th className="col-quality">퀄리티</th>
                <th className="col-price-20">20레벨</th>
                <th className="col-price-21">21레벨</th>
                <th className="col-act">Act</th>
                <th className="col-classes">직업</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading-cell">
                    로딩 중...
                  </td>
                </tr>
              ) : gems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    데이터가 없습니다
                  </td>
                </tr>
              ) : (
                gems.map((gem, index) => (
                  <tr key={gem.id || index}>
                    <td className="icon-cell">
                      <img
                        src={gem.icon}
                        alt={gem.nameKo || gem.name}
                        className="gem-icon"
                      />
                    </td>
                    <td className="name-cell">
                      <span className="gem-name">{gem.nameKo || gem.name}</span>
                    </td>
                    <td className="quality-cell">20%</td>
                    <td className="price-cell price-20">
                      <span className="chaos-price">
                        {gem.chaosValue.toLocaleString()}
                        <img src={chaosIcon} alt="c" className="chaos-icon" />
                      </span>
                    </td>
                    <td className="price-cell price-21">
                      {gem.level21 ? (
                        <span className="chaos-price">
                          {gem.level21.chaosValue.toLocaleString()}
                          <img src={chaosIcon} alt="c" className="chaos-icon" />
                        </span>
                      ) : (
                        <span className="no-data">-</span>
                      )}
                    </td>
                    <td className="act-cell">
                      {gem.vendor?.act > 0 && (
                        <span className="act-label">
                          {actLabels[gem.vendor.act]}
                        </span>
                      )}
                    </td>
                    <td className="classes-cell">
                      {gem.vendor?.classes?.length > 0 && (
                        <div className="vendor-classes">
                          {gem.vendor.classes.map((cls) => (
                            <img
                              key={cls}
                              src={`/images/ui/${cls}.webp`}
                              alt={cls}
                              className="class-icon"
                            />
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="data-source">Data from poe.ninja</p>
      </div>
    </div>
  );
}
