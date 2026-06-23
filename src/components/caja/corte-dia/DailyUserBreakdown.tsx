import { formatMoney } from "@/lib/formatters/money";
import { formatKg } from "@/lib/formatters/weight";
import type { DailyUserBreakdownRow } from "@/lib/modules/corte-dia/types";

export function DailyUserBreakdown({
  rows,
}: {
  rows: DailyUserBreakdownRow[];
}) {
  return (
    <section className="rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-[#1F2933]">
        Desglose por usuario
      </h2>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[#6B7280]">Sin actividad por usuario.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-[#FAF7EF] text-xs font-black uppercase text-[#0B7A3B]">
              <tr>
                <th className="px-3 py-3">Usuario</th>
                <th className="px-3 py-3 text-right">Ventas</th>
                <th className="px-3 py-3 text-right">Pollos</th>
                <th className="px-3 py-3 text-right">Kg</th>
                <th className="px-3 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-t border-[#E8DFC6]" key={row.name}>
                  <td className="px-3 py-3 font-bold text-[#1F2933]">
                    {row.name}
                  </td>
                  <td className="px-3 py-3 text-right">{row.salesCount}</td>
                  <td className="px-3 py-3 text-right">{row.totalChickens}</td>
                  <td className="px-3 py-3 text-right">
                    {formatKg(row.totalWeightKg)}
                  </td>
                  <td className="px-3 py-3 text-right font-black text-[#D92D20]">
                    {formatMoney(row.grandTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
