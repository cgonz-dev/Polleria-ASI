export const moneyFormatter = new Intl.NumberFormat("es-MX", {
  currency: "MXN",
  minimumFractionDigits: 2,
  style: "currency",
});

export function formatMoney(value: number) {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}
