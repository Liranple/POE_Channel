export const POE_NINJA_BASE_URL = "https://poe.ninja/poe1/api/economy";

export const POE_NINJA_REQUEST_OPTIONS = {
  headers: { "User-Agent": "POE-Channel/1.0" },
  next: { revalidate: 3600 },
};

export function getCurrentHourTimestamp(date = new Date()) {
  const currentHour = new Date(date);
  currentHour.setMinutes(0, 0, 0);
  return currentHour.getTime();
}
