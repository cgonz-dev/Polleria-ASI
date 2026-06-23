import { formatMoney } from "@/lib/formatters/money";
import { formatKg } from "@/lib/formatters/weight";
import type { DailySalesSummary } from "@/lib/modules/corte-dia/types";

type DailyCutSummaryCardsProps = {
  summary: DailySalesSummary;
};

function SummaryCard({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "default" | "danger";
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-[#E8DFC6] bg-white px-4 py-4 shadow-sm">
      <p
        className={
          tone === "danger"
            ? "text-xs font-black uppercase text-[#D92D20]"
            : "text-xs font-black uppercase text-[#0B7A3B]"
        }
      >
        {label}
      </p>
      <p
        className={
          tone === "danger"
            ? "mt-2 text-2xl font-black text-[#D92D20]"
            : "mt-2 text-2xl font-black text-[#1F2933]"
        }
      >
        {value}
      </p>
    </div>
  );
}

export function DailyCutSummaryCards({ summary }: DailyCutSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <SummaryCard
        label="Total vendido"
        tone="danger"
        value={formatMoney(summary.grandTotal)}
      />
      <SummaryCard label="Ventas" value={summary.salesCount} />
      <SummaryCard label="Pollos vendidos" value={summary.totalChickens} />
      <SummaryCard label="Kg vendidos" value={formatKg(summary.totalWeightKg)} />
      <SummaryCard
        label="Preparación"
        value={formatMoney(summary.preparationTotal)}
      />
      <SummaryCard
        label="Tickets pendientes"
        value={summary.pendingPrintCount}
      />
    </div>
  );
}
