"use client";

import type { PlumaSale } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { PlumaSaleTicket } from "@/components/tickets/PlumaSaleTicket";

type PlumaSaleTicketModalProps = {
  businessName: string;
  businessPhone: string;
  canPrintTickets: boolean;
  isMarkingPrinted?: boolean;
  onClose?: () => void;
  onMarkPrinted?: (sale: PlumaSale) => void;
  onNewSale?: () => void;
  onViewPendingTickets?: () => void;
  sale: PlumaSale | null;
};

export function PlumaSaleTicketModal({
  businessName,
  businessPhone,
  canPrintTickets,
  isMarkingPrinted = false,
  onClose,
  onMarkPrinted,
  onNewSale,
  onViewPendingTickets,
  sale,
}: PlumaSaleTicketModalProps) {
  if (!sale) {
    return null;
  }

  const isPrinted = sale.printed_at != null;
  const canMarkPrinted = canPrintTickets && !isPrinted && onMarkPrinted;
  const statusMessage = isPrinted
    ? "Ticket ya marcado como impreso. Puedes reimprimirlo sin cambiar su historial."
    : canPrintTickets
      ? "Imprime el ticket y después márcalo como impreso."
      : "Ticket registrado. Imprime desde la PC de caja.";

  function handlePrintTicket() {
    document.documentElement.classList.add("printing-ticket");
    document.body.classList.add("printing-ticket");
    window.print();
    window.setTimeout(() => {
      document.documentElement.classList.remove("printing-ticket");
      document.body.classList.remove("printing-ticket");
    }, 500);
  }

  return (
    <div className="ticket-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3">
      <div className="ticket-modal-panel max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-lg border border-[#E8DFC6] bg-[#FAF7EF] p-4 shadow-xl">
        <div className="no-print mb-4 flex flex-col gap-3 rounded-md border border-[#E8DFC6] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#0B7A3B]">
              Ticket listo
            </p>
            <h2 className="text-xl font-black text-[#1F2933]">
              {sale.sale_number}
            </h2>
            <p className="text-sm text-[#6B7280]">{statusMessage}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            {canPrintTickets ? (
              <Button
                className="h-11 bg-[#D92D20] px-4 font-bold text-white hover:bg-[#B42318]"
                onClick={handlePrintTicket}
                type="button"
              >
                {isPrinted ? "Reimprimir" : "Imprimir ticket"}
              </Button>
            ) : null}
            {canMarkPrinted ? (
              <Button
                className="h-11 bg-[#0B7A3B] px-4 font-bold text-white hover:bg-[#096732]"
                disabled={isMarkingPrinted}
                onClick={() => onMarkPrinted(sale)}
                type="button"
              >
                {isMarkingPrinted ? "Marcando..." : "Marcar como impreso"}
              </Button>
            ) : null}
            {!canPrintTickets && onViewPendingTickets ? (
              <Button
                className="h-11 border-[#0B7A3B] bg-white px-4 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
                onClick={onViewPendingTickets}
                type="button"
                variant="outline"
              >
                Ver tickets pendientes
              </Button>
            ) : null}
            <Button
              className="h-11 border-[#0B7A3B] bg-white px-4 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
              onClick={onNewSale ?? onClose}
              type="button"
              variant="outline"
            >
              {onNewSale ? "Nueva venta" : "Cerrar"}
            </Button>
          </div>
        </div>

        <div className="ticket-modal-body flex justify-center">
          <PlumaSaleTicket
            businessName={businessName}
            businessPhone={businessPhone}
            sale={sale}
          />
        </div>
      </div>
    </div>
  );
}
