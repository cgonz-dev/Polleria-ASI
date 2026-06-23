import { formatDateTimeMx } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";
import type {
  DailyClosureSnapshot,
  DailySalesSummary,
} from "@/lib/modules/corte-dia/types";
import { hasClosureMismatch } from "@/lib/modules/corte-dia/calculations";

export function DailyClosureStatus({
  closure,
  summary,
}: {
  closure: DailyClosureSnapshot | null;
  summary: DailySalesSummary;
}) {
  if (!closure) {
    return (
      <section className="rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm">
        <p className="text-sm font-black uppercase text-[#6B7280]">
          Estado de cierre
        </p>
        <h2 className="mt-2 text-xl font-black text-[#1F2933]">
          Este día aún no ha sido cerrado.
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Puedes revisar ventas en vivo y cerrar el corte cuando termine la
          operación.
        </p>
      </section>
    );
  }

  const hasMismatch = hasClosureMismatch(closure, summary);
  const wasUpdated =
    new Date(closure.updated_at).getTime() !==
    new Date(closure.created_at).getTime();
  const differenceLabel =
    closure.cash_difference < 0
      ? "Faltante"
      : closure.cash_difference > 0
        ? "Sobrante"
        : "Diferencia";

  return (
    <section className="rounded-lg border border-[#0B7A3B]/25 bg-[#EAF7EE] p-4 shadow-sm">
      <p className="text-sm font-black uppercase text-[#0B7A3B]">
        Corte cerrado
      </p>
      <h2 className="mt-2 text-xl font-black leading-tight text-[#1F2933]">
        {formatMoney(closure.counted_cash_total)} efectivo contado
      </h2>
      <div className="mt-3 grid gap-3 text-sm text-[#1F2933] sm:grid-cols-2">
        <div className="rounded-md bg-white/70 px-3 py-2">
          <p className="text-xs font-black uppercase text-[#6B7280]">
            Cerrado por
          </p>
          <p className="mt-1 font-bold">
            {closure.closedByName ?? "Usuario no disponible"}
          </p>
        </div>
        <div className="rounded-md bg-white/70 px-3 py-2">
          <p className="text-xs font-black uppercase text-[#6B7280]">
            Fecha de cierre
          </p>
          <p className="mt-1 font-bold">
            {formatDateTimeMx(closure.created_at)}
          </p>
        </div>
        <div className="rounded-md bg-white/70 px-3 py-2">
          <p className="text-xs font-black uppercase text-[#6B7280]">
            Efectivo esperado
          </p>
          <p className="mt-1 font-black">
            {formatMoney(closure.expected_cash_total)}
          </p>
        </div>
        <div className="rounded-md bg-white/70 px-3 py-2">
          <p className="text-xs font-black uppercase text-[#6B7280]">
            {differenceLabel}
          </p>
          <p
            className={
              closure.cash_difference === 0
                ? "mt-1 font-black text-[#0B7A3B]"
                : "mt-1 font-black text-[#D92D20]"
            }
          >
            {formatMoney(closure.cash_difference)}
          </p>
        </div>
      </div>
      {wasUpdated ? (
        <p className="mt-3 text-sm font-semibold text-[#1F2933]">
          Última actualización del cierre:{" "}
          {formatDateTimeMx(closure.updated_at)}
        </p>
      ) : null}
      {closure.notes ? (
        <p className="mt-3 rounded-md bg-white/70 px-3 py-2 text-sm text-[#1F2933]">
          {closure.notes}
        </p>
      ) : null}
      {hasMismatch ? (
        <p className="mt-3 rounded-md border border-[#D92D20]/25 bg-white px-3 py-2 text-sm font-semibold text-[#D92D20]">
          Hay ventas nuevas o cambios posteriores al cierre. Revisa si
          necesitas actualizar el corte.
        </p>
      ) : null}
    </section>
  );
}
