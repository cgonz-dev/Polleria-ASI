import { formatDateMx, formatDateTimeMx } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";
import { formatKg } from "@/lib/formatters/weight";
import { hasClosureMismatch } from "@/lib/modules/corte-dia/calculations";
import type { DailyCutData } from "@/lib/modules/corte-dia/types";

export function DailyCutPrintView({
  data,
  lastUpdatedAt,
}: {
  data: DailyCutData;
  lastUpdatedAt: Date | null;
}) {
  const { closure, customerTypeBreakdown, summary, userBreakdown } = data;
  const closureWasUpdated =
    closure &&
    new Date(closure.updated_at).getTime() !==
      new Date(closure.created_at).getTime();
  const differenceLabel = closure
    ? closure.cash_difference < 0
      ? "Faltante"
      : closure.cash_difference > 0
        ? "Sobrante"
        : "Diferencia"
    : "Diferencia";
  const hasMismatch = closure ? hasClosureMismatch(closure, summary) : false;

  return (
    <article className="corte-dia-print-area">
      <header className="corte-print-header">
        <h1>POLLERÍA ASI</h1>
        <p>CORTE DEL DÍA</p>
      </header>

      <section className="corte-print-section">
        <p>Fecha: {formatDateMx(data.businessDate)}</p>
        <p>
          Última actualización:{" "}
          {lastUpdatedAt ? formatDateTimeMx(lastUpdatedAt) : "Sin actualizar"}
        </p>
      </section>

      <section className="corte-print-section">
        <h2>Resumen</h2>
        <p>Total vendido: {formatMoney(summary.grandTotal)}</p>
        <p>Ventas: {summary.salesCount}</p>
        <p>Pollos vendidos: {summary.totalChickens}</p>
        <p>Kg vendidos: {formatKg(summary.totalWeightKg)}</p>
        <p>Preparación: {formatMoney(summary.preparationTotal)}</p>
        <p>Servicios extra: {formatMoney(summary.extraServicesTotal)}</p>
      </section>

      <section className="corte-print-section">
        <h2>Financiero</h2>
        <p>Subtotal pollo: {formatMoney(summary.chickenSubtotal)}</p>
        <p>Preparación: {formatMoney(summary.preparationTotal)}</p>
        <p>Despielada: {formatMoney(summary.skinningTotal)}</p>
        <p>Pechuga fileteada: {formatMoney(summary.breastFilletTotal)}</p>
        <p>Servicios extra: {formatMoney(summary.extraServicesTotal)}</p>
        <p>Total efectivo esperado: {formatMoney(summary.grandTotal)}</p>
      </section>

      <section className="corte-print-section">
        <h2>Tickets</h2>
        <p>Tickets impresos: {summary.printedCount}</p>
        <p>Tickets pendientes: {summary.pendingPrintCount}</p>
      </section>

      <section className="corte-print-section">
        <h2>Desglose por usuario</h2>
        {userBreakdown.length === 0 ? (
          <p>Sin actividad por usuario.</p>
        ) : (
          userBreakdown.map((row) => (
            <p key={row.name}>
              {row.name} | {row.salesCount} ventas | {row.totalChickens} pollos
              | {formatKg(row.totalWeightKg)} | {formatMoney(row.grandTotal)}
            </p>
          ))
        )}
      </section>

      <section className="corte-print-section">
        <h2>Público general vs preferenciales</h2>
        {customerTypeBreakdown.map((row) => (
          <p key={row.customerType}>
            {row.label}: {row.salesCount} ventas | {row.totalChickens} pollos |{" "}
            {formatKg(row.totalWeightKg)} | {formatMoney(row.grandTotal)}
          </p>
        ))}
      </section>

      <section className="corte-print-section">
        <h2>Estado de cierre</h2>
        {closure ? (
          <>
            <p>Corte cerrado</p>
            <p>Cerrado por: {closure.closedByName ?? "Usuario no disponible"}</p>
            <p>Fecha de cierre: {formatDateTimeMx(closure.created_at)}</p>
            {closureWasUpdated ? (
              <p>
                Última actualización del cierre:{" "}
                {formatDateTimeMx(closure.updated_at)}
              </p>
            ) : null}
            <p>Efectivo esperado: {formatMoney(closure.expected_cash_total)}</p>
            <p>Efectivo contado: {formatMoney(closure.counted_cash_total)}</p>
            <p>
              {differenceLabel}: {formatMoney(closure.cash_difference)}
            </p>
            <p>Despielada: {formatMoney(closure.skinning_total ?? 0)}</p>
            <p>
              Pechuga fileteada:{" "}
              {formatMoney(closure.breast_fillet_total ?? 0)}
            </p>
            <p>
              Servicios extra: {formatMoney(closure.extra_services_total ?? 0)}
            </p>
            {closure.notes ? <p>Notas: {closure.notes}</p> : null}
            {hasMismatch ? (
              <p>
                Hay ventas nuevas o cambios posteriores al cierre. Revisa si
                necesitas actualizar el corte.
              </p>
            ) : null}
          </>
        ) : (
          <p>Este día aún no ha sido cerrado.</p>
        )}
      </section>
    </article>
  );
}
