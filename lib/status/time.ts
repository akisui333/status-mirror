const BEIJING_TIME_ZONE = "Asia/Shanghai";

const beijingDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: BEIJING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function parseSourceDate(value: string | number | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  const trimmed = value.trim();
  const utcTimestampMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
  );

  if (utcTimestampMatch) {
    const [, year, month, day, hour, minute, second = "00", millisecond = "0"] =
      utcTimestampMatch;

    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
        Number(millisecond.padEnd(3, "0"))
      )
    );
  }

  return new Date(trimmed);
}

export function formatBeijingDateTime(value: string | number | Date): string {
  const date = parseSourceDate(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = beijingDateTimeFormatter.formatToParts(date);
  const lookup = new Map(parts.map((part) => [part.type, part.value]));

  return `${lookup.get("year")}-${lookup.get("month")}-${lookup.get("day")} ${lookup.get("hour")}:${lookup.get("minute")}:${lookup.get("second")}`;
}
