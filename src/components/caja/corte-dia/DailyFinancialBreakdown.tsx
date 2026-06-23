import { formatMoney } from "@/lib/formatters/money";
import type { DailySalesSummary } from "@/lib/modules/corte-dia/types";

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E8DFC6] py-3 last:border-b-0">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className="text-right text-sm font-black text-[#1F2933]">
        {value}
      </span>
    </div>
  );
}

export function DailyFinancialBreakdown({
  summary,
}: {
  summary: DailySalesSummary;
}) {
  return (
    <section className="rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-[#1F2933]">
        Desglose financiero
      </h2>
      <div className="mt-3">
        <BreakdownRow
          label="Subtotal pollo"
          value={formatMoney(summary.chickenSubtotal)}
        />
        <BreakdownRow
          label="Preparación"
          value={formatMoney(summary.preparationTotal)}
        />
        <BreakdownRow
          label="Total efectivo esperado"
          value={formatMoney(summary.grandTotal)}
        />
      </div>
    </section>
  );
}
