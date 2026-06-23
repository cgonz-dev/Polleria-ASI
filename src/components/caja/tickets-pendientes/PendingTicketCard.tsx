import { Button } from "@/components/ui/button";
import { formatDateTimeMx } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";
import { formatKg } from "@/lib/formatters/weight";
import type { PlumaSale } from "@/lib/supabase/types";

type PendingTicketCardProps = {
  canPrintTickets: boolean;
  onPrint: (sale: PlumaSale) => void;
  onView: (sale: PlumaSale) => void;
  sale: PlumaSale;
};

function getCustomerName(sale: PlumaSale) {
  return sale.customer_name_snapshot?.trim() || "Público general";
}

export function PendingTicketCard({
  canPrintTickets,
  onPrint,
  onView,
  sale,
}: PendingTicketCardProps) {
  const chickenLabel = sale.chicken_quantity === 1 ? "pollo" : "pollos";

  return (
    <article className="rounded-md border border-[#E8DFC6] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-[#1F2933]">
              {sale.sale_number}
            </h3>
            <span className="rounded-full border border-[#D92D20]/20 bg-[#FFF1F0] px-2 py-1 text-xs font-black text-[#D92D20]">
              Pendiente
            </span>
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">
            {formatDateTimeMx(sale.created_at)}
          </p>
          <p className="mt-3 text-sm font-semibold text-[#1F2933]">
            Cliente: {getCustomerName(sale)}
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            {sale.chicken_quantity} {chickenLabel} ·{" "}
            {formatKg(sale.total_weight_kg)}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-black uppercase tracking-wide text-[#D92D20]">
            Total
          </p>
          <p className="text-2xl font-black text-[#D92D20]">
            {formatMoney(sale.grand_total)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          className="h-10 border-[#0B7A3B] bg-white px-4 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
          onClick={() => onView(sale)}
          type="button"
          variant="outline"
        >
          Ver ticket
        </Button>
        {canPrintTickets ? (
          <Button
            className="h-10 bg-[#D92D20] px-4 font-bold text-white hover:bg-[#B42318]"
            onClick={() => onPrint(sale)}
            type="button"
          >
            Imprimir
          </Button>
        ) : (
          <span className="text-sm font-semibold text-[#6B7280]">
            Impresión solo disponible en PC de caja
          </span>
        )}
      </div>
    </article>
  );
}
