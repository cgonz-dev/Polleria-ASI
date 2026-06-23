function toDisplayDate(value: string | Date) {
  if (value instanceof Date) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00.000Z`);
  }

  return new Date(value);
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function formatDateTimeMx(value: string | Date) {
  const date = toDisplayDate(value);
  const dateText = formatDateMx(date);
  const timeText = new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(date);

  return `${dateText} ${normalizeSpaces(timeText)}`;
}

export function formatDateMx(value: string | Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Mexico_City",
    year: "numeric",
  }).format(toDisplayDate(value));
}
