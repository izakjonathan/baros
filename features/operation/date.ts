const venueTimeZone = "Europe/Copenhagen";

export function operationDateNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: venueTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

/**
 * Cash counts made after midnight belong to the bar day that is still being
 * closed. The cutoff is deliberately fixed at 02:00 Copenhagen time.
 */
export function operationCountDateNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: venueTimeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value || "";
  const year = Number(value("year"));
  const month = Number(value("month"));
  const day = Number(value("day"));
  const hour = Number(value("hour"));
  if (![year, month, day, hour].every(Number.isFinite)) return operationDateNow(date);
  const operationalDay = new Date(Date.UTC(year, month - 1, day) - (hour < 2 ? 86_400_000 : 0));
  return operationalDay.toISOString().slice(0, 10);
}

export const operationTimeZone = venueTimeZone;
