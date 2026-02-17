/**
 * Utility helpers
 */

/**
 * Formats date as YY-MM-DD  HH:MM
 */
export function formatDate(date = new Date()) {
  const yy = date.getFullYear().toString().slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yy}-${mm}-${dd}  ${hh}:${min}`;
}