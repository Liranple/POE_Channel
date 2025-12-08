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
