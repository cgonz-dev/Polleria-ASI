export function formatDateTimeMx(value: string | Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Mexico_City",
    year: "numeric",
  }).format(new Date(value));
}
