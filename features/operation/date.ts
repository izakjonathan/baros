const venueTimeZone = "Europe/Copenhagen";

export function operationDateNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: venueTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export const operationTimeZone = venueTimeZone;
