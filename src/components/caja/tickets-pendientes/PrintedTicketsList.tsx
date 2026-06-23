import { Button } from "@/components/ui/button";
import { formatDateTimeMx } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";
import type { PlumaSale } from "@/lib/supabase/types";

type PrintedTicketsListProps = {
  canPrintTickets: boolean;
  onOpen: (sale: PlumaSale) => void;
  tickets: PlumaSale[];
};

function getCustomerName(sale: PlumaSale) {
  return sale.customer_name_snapshot?.trim() || "Público general";
}

export function PrintedTicketsList({
  canPrintTickets,
  onOpen,
  tickets,
}: PrintedTicketsListProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-md border border-[#E8DFC6] bg-white px-4 py-6 text-sm text-[#6B7280] shadow-sm">
        Todavía no hay tickets marcados como impresos.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#E8DFC6] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-[#FAF7EF] text-xs font-black uppercase text-[#0B7A3B]">
            <tr>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Impreso</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr className="border-t border-[#E8DFC6]" key={ticket.id}>
                <td className="px-4 py-3 font-black text-[#1F2933]">
                  {ticket.sale_number}
                </td>
                <td className="px-4 py-3 text-[#6B7280]">
                  {getCustomerName(ticket)}
                </td>
                <td className="px-4 py-3 text-[#6B7280]">
                  {ticket.printed_at
                    ? formatDateTimeMx(ticket.printed_at)
                    : "Sin fecha"}
                </td>
                <td className="px-4 py-3 text-right font-black text-[#D92D20]">
                  {formatMoney(ticket.grand_total)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    className="h-9 border-[#0B7A3B] bg-white px-3 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
                    onClick={() => onOpen(ticket)}
                    type="button"
                    variant="outline"
                  >
                    {canPrintTickets ? "Reimprimir" : "Ver ticket"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
