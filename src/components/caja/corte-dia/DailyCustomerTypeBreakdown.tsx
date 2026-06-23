import { formatMoney } from "@/lib/formatters/money";
import { formatKg } from "@/lib/formatters/weight";
import type { DailyCustomerTypeBreakdownRow } from "@/lib/modules/corte-dia/types";

export function DailyCustomerTypeBreakdown({
  rows,
}: {
  rows: DailyCustomerTypeBreakdownRow[];
}) {
  return (
    <section className="rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-[#1F2933]">
        Público general vs premium
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] p-4"
            key={row.customerType}
          >
            <p className="text-sm font-black text-[#0B7A3B]">{row.label}</p>
            <div className="mt-3 grid gap-2 text-sm text-[#6B7280]">
              <p>
                Ventas:{" "}
                <span className="font-bold text-[#1F2933]">
                  {row.salesCount}
                </span>
              </p>
              <p>
                Pollos:{" "}
                <span className="font-bold text-[#1F2933]">
                  {row.totalChickens}
                </span>
              </p>
              <p>
                Kg:{" "}
                <span className="font-bold text-[#1F2933]">
                  {formatKg(row.totalWeightKg)}
                </span>
              </p>
              <p>
                Total:{" "}
                <span className="font-black text-[#D92D20]">
                  {formatMoney(row.grandTotal)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
