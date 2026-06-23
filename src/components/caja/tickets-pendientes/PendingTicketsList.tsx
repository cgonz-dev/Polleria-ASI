import { PendingTicketCard } from "@/components/caja/tickets-pendientes/PendingTicketCard";
import type { PlumaSale } from "@/lib/supabase/types";

type PendingTicketsListProps = {
  canPrintTickets: boolean;
  onPrint: (sale: PlumaSale) => void;
  onView: (sale: PlumaSale) => void;
  tickets: PlumaSale[];
};

export function PendingTicketsList({
  canPrintTickets,
  onPrint,
  onView,
  tickets,
}: PendingTicketsListProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-md border border-[#E8DFC6] bg-white px-4 py-8 text-center text-sm text-[#6B7280] shadow-sm">
        No hay tickets pendientes por imprimir.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {tickets.map((ticket) => (
        <PendingTicketCard
          canPrintTickets={canPrintTickets}
          key={ticket.id}
          onPrint={onPrint}
          onView={onView}
          sale={ticket}
        />
      ))}
    </div>
  );
}
