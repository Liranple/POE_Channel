/**
 * 유틸리티 함수 모음
 */

/**
 * 날짜를 포맷팅합니다.
 * @param {Date} date - 날짜 객체 (기본값: 현재 시간)
 * @returns {string} 포맷된 날짜 문자열 (YY-MM-DD  HH:MM)
 */
export function formatDate(date = new Date()) {
  const yy = date.getFullYear().toString().slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yy}-${mm}-${dd}  ${hh}:${min}`;
}

/**
 * 비밀번호를 검증합니다.
 * 참고: 마스터 비밀번호 검증은 서버에서만 수행됩니다.
 * @param {string} inputPassword - 입력된 비밀번호
 * @param {string} storedPassword - 저장된 비밀번호
 * @returns {boolean} 비밀번호 일치 여부
 */
export function validatePassword(inputPassword, storedPassword) {
  return inputPassword === storedPassword;
}

/**
 * 고유 ID를 생성합니다.
 * @returns {string} 고유 ID
 */
export function generateId() {
  return crypto.randomUUID();
}

/**
 * 텍스트가 여러 줄인지 확인합니다.
 * @param {string} text - 확인할 텍스트
 * @returns {boolean} 여러 줄 여부
 */
export function isMultiLine(text) {
  return text && text.includes("\n");
}

/**
 * 로컬 스토리지에서 데이터를 가져옵니다.
 * @param {string} key - 스토리지 키
 * @param {*} defaultValue - 기본값
 * @returns {*} 저장된 데이터 또는 기본값
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error(`Failed to load from localStorage: ${key}`, e);
    return defaultValue;
  }
}

/**
 * 로컬 스토리지에 데이터를 저장합니다.
 * @param {string} key - 스토리지 키
 * @param {*} data - 저장할 데이터
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to localStorage: ${key}`, e);
  }
}
