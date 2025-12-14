// 시세 히스토리 저장 유틸리티 (Upstash Redis)

import { Redis } from "@upstash/redis";
import pako from "pako";

// Redis 클라이언트 (싱글톤)
let redis = null;

function getRedis() {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}

// 히스토리 키 (API 타입별)
const HISTORY_KEYS = {
  currency: "history:currency", // 점술 카드
  items: "history:items", // 유니크 아이템
  gems: "history:gems", // 서포트 젬
};

// 최대 저장 개수 (24시간)
const MAX_HISTORY_COUNT = 24;

/**
 * 데이터 압축 (gzip)
 * @param {object} data - 압축할 데이터
 * @returns {string} - Base64 인코딩된 압축 데이터
 */
function compressData(data) {
  const jsonString = JSON.stringify(data);
  const compressed = pako.gzip(jsonString);
  // Uint8Array를 Base64로 변환
  return Buffer.from(compressed).toString("base64");
}

/**
 * 데이터 압축 해제
 * @param {string} compressedBase64 - Base64 인코딩된 압축 데이터
 * @returns {object} - 원본 데이터
 */
function decompressData(compressedBase64) {
  const compressed = Buffer.from(compressedBase64, "base64");
  const decompressed = pako.ungzip(compressed, { to: "string" });
  return JSON.parse(decompressed);
}

/**
 * 시세 히스토리 저장
 * 24개까지 저장하고, 초과 시 가장 오래된 데이터 삭제
 *
 * @param {string} type - API 타입 (currency, items, gems)
 * @param {object} data - 저장할 데이터
 * @returns {Promise<boolean>} - 성공 여부
 */
export async function savePriceHistory(type, data) {
  try {
    const client = getRedis();
    const key = HISTORY_KEYS[type];

    if (!key) {
      console.error(`Invalid history type: ${type}`);
      return false;
    }

    // 현재 정시 timestamp
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const timestamp = now.getTime();

    // 저장할 히스토리 항목
    const historyEntry = {
      timestamp,
      data: compressData(data), // 압축하여 저장
    };

    // 기존 히스토리 가져오기
    let history = (await client.get(key)) || [];

    // 같은 시간대 데이터가 이미 있으면 업데이트
    const existingIndex = history.findIndex((h) => h.timestamp === timestamp);
    if (existingIndex !== -1) {
      history[existingIndex] = historyEntry;
    } else {
      // 새 데이터 추가
      history.push(historyEntry);

      // 24개 초과 시 가장 오래된 것 삭제
      if (history.length > MAX_HISTORY_COUNT) {
        // timestamp 기준 오름차순 정렬 후 앞에서 제거
        history.sort((a, b) => a.timestamp - b.timestamp);
        history = history.slice(-MAX_HISTORY_COUNT);
      }
    }

    // Redis에 저장
    await client.set(key, history);

    console.log(
      `[PriceHistory] Saved ${type} history at ${new Date(
        timestamp
      ).toISOString()}, total: ${history.length}`
    );
    return true;
  } catch (error) {
    console.error(`[PriceHistory] Failed to save ${type}:`, error);
    return false;
  }
}

/**
 * 시세 히스토리 조회
 *
 * @param {string} type - API 타입 (currency, items, gems)
 * @param {number} limit - 조회할 개수 (기본값: 24)
 * @returns {Promise<Array>} - 히스토리 배열 (최신순)
 */
export async function getPriceHistory(type, limit = 24) {
  try {
    const client = getRedis();
    const key = HISTORY_KEYS[type];

    if (!key) {
      console.error(`Invalid history type: ${type}`);
      return [];
    }

    const history = (await client.get(key)) || [];

    // 압축 해제하여 반환 (최신순 정렬)
    const decompressedHistory = history
      .map((entry) => ({
        timestamp: entry.timestamp,
        data: decompressData(entry.data),
      }))
      .sort((a, b) => b.timestamp - a.timestamp) // 최신순
      .slice(0, limit);

    return decompressedHistory;
  } catch (error) {
    console.error(`[PriceHistory] Failed to get ${type}:`, error);
    return [];
  }
}

/**
 * 특정 시간대의 시세 조회
 *
 * @param {string} type - API 타입
 * @param {number} timestamp - 조회할 시간 (ms)
 * @returns {Promise<object|null>} - 해당 시간의 데이터 또는 null
 */
export async function getPriceAtTime(type, timestamp) {
  try {
    const client = getRedis();
    const key = HISTORY_KEYS[type];

    if (!key) return null;

    const history = (await client.get(key)) || [];
    const entry = history.find((h) => h.timestamp === timestamp);

    if (!entry) return null;

    return {
      timestamp: entry.timestamp,
      data: decompressData(entry.data),
    };
  } catch (error) {
    console.error(
      `[PriceHistory] Failed to get ${type} at ${timestamp}:`,
      error
    );
    return null;
  }
}

/**
 * 히스토리 통계 조회 (용량 확인용)
 *
 * @returns {Promise<object>} - 각 타입별 저장된 개수
 */
export async function getHistoryStats() {
  try {
    const client = getRedis();
    const stats = {};

    for (const [type, key] of Object.entries(HISTORY_KEYS)) {
      const history = (await client.get(key)) || [];
      stats[type] = {
        count: history.length,
        oldest:
          history.length > 0
            ? new Date(
                Math.min(...history.map((h) => h.timestamp))
              ).toISOString()
            : null,
        newest:
          history.length > 0
            ? new Date(
                Math.max(...history.map((h) => h.timestamp))
              ).toISOString()
            : null,
      };
    }

    return stats;
  } catch (error) {
    console.error("[PriceHistory] Failed to get stats:", error);
    return {};
  }
}

/**
 * 가장 최근 히스토리 데이터 조회 (Fallback용)
 *
 * @param {string} type - API 타입 (currency, items, gems)
 * @returns {Promise<object|null>} - 가장 최근 데이터 또는 null
 */
export async function getLatestHistory(type) {
  try {
    const client = getRedis();
    const key = HISTORY_KEYS[type];

    if (!key) {
      console.error(`Invalid history type: ${type}`);
      return null;
    }

    const history = (await client.get(key)) || [];

    if (history.length === 0) {
      return null;
    }

    // 가장 최근 데이터 찾기
    const latest = history.reduce((prev, current) =>
      prev.timestamp > current.timestamp ? prev : current
    );

    return {
      timestamp: latest.timestamp,
      data: decompressData(latest.data),
    };
  } catch (error) {
    console.error(`[PriceHistory] Failed to get latest ${type}:`, error);
    return null;
  }
}

/**
 * 리트라이가 포함된 fetch 함수
 * 실패 시 3~4회 재시도, 점진적 딜레이 적용
 *
 * @param {string} url - 요청 URL
 * @param {object} options - fetch 옵션
 * @param {number} maxRetries - 최대 재시도 횟수 (기본값: 3)
 * @returns {Promise<Response>} - fetch 응답
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      // 429 (Too Many Requests) 또는 5xx 에러면 재시도
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
        console.warn(
          `[fetchWithRetry] Attempt ${attempt + 1}/${
            maxRetries + 1
          } failed for ${url}: ${response.status}`
        );
      } else {
        // 4xx 에러 (429 제외)는 재시도하지 않음
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      lastError = error;
      console.warn(
        `[fetchWithRetry] Attempt ${attempt + 1}/${
          maxRetries + 1
        } failed for ${url}: ${error.message}`
      );
    }

    // 마지막 시도가 아니면 딜레이 후 재시도
    if (attempt < maxRetries) {
      // 점진적 딜레이: 1초, 2초, 3초 (차단 방지)
      const delay = (attempt + 1) * 1000;
      console.log(`[fetchWithRetry] Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
