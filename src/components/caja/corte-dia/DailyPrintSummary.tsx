import Link from "next/link";

import type { DailySalesSummary } from "@/lib/modules/corte-dia/types";

export function DailyPrintSummary({ summary }: { summary: DailySalesSummary }) {
  return (
    <section className="rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-[#1F2933]">Tickets</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Estado de impresión de ventas completadas.
          </p>
        </div>
        <Link
          className="inline-flex h-11 w-full items-center justify-center rounded-md border border-[#0B7A3B] bg-white px-4 text-sm font-bold text-[#0B7A3B] hover:bg-[#EAF7EE] sm:h-10 sm:w-auto"
          href="/caja/tickets-pendientes"
        >
          Ver tickets pendientes
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] p-4">
          <p className="text-xs font-black uppercase text-[#0B7A3B]">
            Tickets impresos
          </p>
          <p className="mt-2 text-3xl font-black text-[#1F2933]">
            {summary.printedCount}
          </p>
        </div>
        <div className="rounded-md border border-[#E8DFC6] bg-[#FFF1F0] p-4">
          <p className="text-xs font-black uppercase text-[#D92D20]">
            Tickets pendientes
          </p>
          <p className="mt-2 text-3xl font-black text-[#D92D20]">
            {summary.pendingPrintCount}
          </p>
        </div>
      </div>
    </section>
  );
}
