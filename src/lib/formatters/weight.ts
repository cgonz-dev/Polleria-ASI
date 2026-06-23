export function formatKg(value: number) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(3)} kg`;
}
