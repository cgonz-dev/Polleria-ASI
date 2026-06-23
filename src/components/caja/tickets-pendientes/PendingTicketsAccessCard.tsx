"use client";

import * as React from "react";
import Link from "next/link";

import { PendingTicketsBadge } from "@/components/caja/tickets-pendientes/PendingTicketsBadge";
import {
  getPendingPlumaTicketsCount,
  subscribeToPlumaSalesPrintChanges,
} from "@/lib/modules/tickets-pendientes/service";

type PendingTicketsAccessCardProps = {
  canPrintTickets: boolean;
};

export function PendingTicketsAccessCard({
  canPrintTickets,
}: PendingTicketsAccessCardProps) {
  const [count, setCount] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);

  const loadCount = React.useCallback(async () => {
    try {
      const pendingCount = await getPendingPlumaTicketsCount();
      setCount(pendingCount);
      setHasError(false);
    } catch {
      setHasError(true);
    }
  }, []);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCount();
    }, 0);

    const unsubscribe = subscribeToPlumaSalesPrintChanges(() => {
      void loadCount();
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [loadCount]);

  return (
    <Link
      className="block rounded-md border border-[#0B7A3B]/20 bg-[#EAF7EE] px-4 py-3 text-sm shadow-sm transition hover:border-[#0B7A3B]/40 hover:bg-[#DFF2E6]"
      href="/caja/tickets-pendientes"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-black text-[#0B7A3B]">
            {canPrintTickets ? "Ir a imprimir tickets" : "Ver tickets pendientes"}
          </p>
          <p className="mt-1 text-xs font-medium text-[#6B7280]">
            {hasError
              ? "No se pudo cargar el contador."
              : "Tickets pendientes por imprimir"}
          </p>
        </div>
        <PendingTicketsBadge count={count} />
      </div>
    </Link>
  );
}
