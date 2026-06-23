"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { PendingTicketsBadge } from "@/components/caja/tickets-pendientes/PendingTicketsBadge";
import { PendingTicketsList } from "@/components/caja/tickets-pendientes/PendingTicketsList";
import { PrintedTicketsList } from "@/components/caja/tickets-pendientes/PrintedTicketsList";
import { PlumaSaleTicketModal } from "@/components/tickets/PlumaSaleTicketModal";
import { Button } from "@/components/ui/button";
import { canPrintTickets as canUserPrintTickets } from "@/lib/auth/permissions";
import {
  getPendingPlumaTickets,
  getPrintedPlumaTickets,
  markPlumaSalePrinted,
  subscribeToPlumaSalesPrintChanges,
} from "@/lib/modules/tickets-pendientes/service";
import { isPendingPrintSale } from "@/lib/modules/tickets-pendientes/types";
import { getBusinessSettings } from "@/lib/modules/ventas-pluma/service";
import type { BusinessSettings, PlumaSale } from "@/lib/supabase/types";

const REAL_BUSINESS_PHONE = "456-106-0141";

function sortPendingTickets(tickets: PlumaSale[]) {
  return [...tickets].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );
}

function sortPrintedTickets(tickets: PlumaSale[]) {
  return [...tickets].sort(
    (left, right) =>
      new Date(right.printed_at ?? 0).getTime() -
      new Date(left.printed_at ?? 0).getTime()
  );
}

function mergePrintedTicket(tickets: PlumaSale[], sale: PlumaSale) {
  return sortPrintedTickets([
    sale,
    ...tickets.filter((ticket) => ticket.id !== sale.id),
  ]).slice(0, 20);
}

function getBusinessPhone(settings: BusinessSettings | null) {
  return settings?.phone?.trim() && settings.phone.trim() !== "000-000-0000"
    ? settings.phone.trim()
    : REAL_BUSINESS_PHONE;
}

function toPlumaSale(value: unknown): PlumaSale | null {
  if (!value || typeof value !== "object" || !("id" in value)) {
    return null;
  }

  return value as PlumaSale;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se pudieron cargar los tickets. Intenta actualizar.";
}

export function PendingTicketsPage() {
  const { user } = useAuth();
  const canPrintTickets = canUserPrintTickets(user);
  const [businessSettings, setBusinessSettings] =
    React.useState<BusinessSettings | null>(null);
  const [pendingTickets, setPendingTickets] = React.useState<PlumaSale[]>([]);
  const [printedTickets, setPrintedTickets] = React.useState<PlumaSale[]>([]);
  const [selectedSale, setSelectedSale] = React.useState<PlumaSale | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isMarkingPrinted, setIsMarkingPrinted] = React.useState(false);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const loadData = React.useCallback(async (showLoader: boolean) => {
    if (showLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    const [settingsResult, pendingResult, printedResult] =
      await Promise.allSettled([
        getBusinessSettings(),
        getPendingPlumaTickets(),
        getPrintedPlumaTickets(),
      ]);

    if (settingsResult.status === "fulfilled") {
      setBusinessSettings(settingsResult.value);
    }

    if (pendingResult.status === "fulfilled") {
      setPendingTickets(sortPendingTickets(pendingResult.value));
    }

    if (printedResult.status === "fulfilled") {
      setPrintedTickets(sortPrintedTickets(printedResult.value));
    }

    if (pendingResult.status === "rejected") {
      setError(getErrorMessage(pendingResult.reason));
    } else if (printedResult.status === "rejected") {
      setError(getErrorMessage(printedResult.reason));
    } else {
      setError("");
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData(true);
    }, 0);

    const unsubscribe = subscribeToPlumaSalesPrintChanges((payload) => {
      const newSale = toPlumaSale(payload.new);

      if (payload.eventType === "INSERT" && isPendingPrintSale(newSale)) {
        setMessage(`Nuevo ticket pendiente: ${newSale.sale_number}`);
      }

      void loadData(false);
    });

    const intervalId = window.setInterval(() => {
      void loadData(false);
    }, 30000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      unsubscribe();
    };
  }, [loadData]);

  async function handleMarkPrinted(sale: PlumaSale) {
    if (!canPrintTickets) {
      setError("No tienes permiso para marcar tickets como impresos.");
      return;
    }

    setIsMarkingPrinted(true);
    setError("");
    setMessage("");

    try {
      const printedSale = await markPlumaSalePrinted(sale.id);
      setPendingTickets((tickets) =>
        tickets.filter((ticket) => ticket.id !== printedSale.id)
      );
      setPrintedTickets((tickets) => mergePrintedTicket(tickets, printedSale));
      setSelectedSale(printedSale);
      setMessage(`Ticket ${printedSale.sale_number} marcado como impreso.`);
    } catch {
      setError("No se pudo marcar el ticket como impreso.");
    } finally {
      setIsMarkingPrinted(false);
    }
  }

  return (
    <section className="brand-workspace rounded-lg p-3 text-[#1F2933] sm:p-5">
      <PlumaSaleTicketModal
        businessName={businessSettings?.business_name ?? "Pollería ASI"}
        businessPhone={getBusinessPhone(businessSettings)}
        canPrintTickets={canPrintTickets}
        isMarkingPrinted={isMarkingPrinted}
        onClose={() => setSelectedSale(null)}
        onMarkPrinted={(sale) => void handleMarkPrinted(sale)}
        sale={selectedSale}
      />

      <div className="mb-5 rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#0B7A3B]">
              Caja
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1F2933] sm:text-3xl">
              Tickets pendientes por imprimir
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Ventas registradas que aún no tienen ticket impreso.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[24rem]">
            <div className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] px-4 py-3">
              <p className="text-xs font-black uppercase text-[#0B7A3B]">
                Pendientes
              </p>
              <div className="mt-2 flex items-center gap-2">
                <PendingTicketsBadge count={pendingTickets.length} />
                <span className="text-sm font-semibold text-[#1F2933]">
                  por imprimir
                </span>
              </div>
            </div>

            <div className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] px-4 py-3">
              <p className="text-xs font-black uppercase text-[#0B7A3B]">
                Permiso
              </p>
              <p className="mt-2 text-sm font-semibold text-[#1F2933]">
                {canPrintTickets
                  ? "Impresión habilitada"
                  : "Solo consulta. Imprime desde la PC de caja."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-5 rounded-md border border-[#D92D20]/30 bg-white px-4 py-3 text-sm font-semibold text-[#D92D20]">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mb-5 rounded-md border border-[#0B7A3B]/25 bg-[#EAF7EE] px-4 py-3 text-sm font-semibold text-[#0B7A3B]">
          {message}
        </div>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#6B7280]">
          {isLoading
            ? "Cargando bandeja..."
            : isRefreshing
              ? "Actualizando..."
              : "La bandeja se actualiza automáticamente con Supabase Realtime."}
        </p>
        <Button
          className="h-11 border-[#0B7A3B] bg-white px-4 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
          disabled={isRefreshing}
          onClick={() => void loadData(false)}
          type="button"
          variant="outline"
        >
          Actualizar
        </Button>
      </div>

      <div className="grid gap-8">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-[#1F2933]">
              Pendientes
            </h2>
            <span className="text-sm font-bold text-[#6B7280]">
              {pendingTickets.length} tickets
            </span>
          </div>
          <PendingTicketsList
            canPrintTickets={canPrintTickets}
            onPrint={setSelectedSale}
            onView={setSelectedSale}
            tickets={pendingTickets}
          />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-xl font-black text-[#1F2933]">
              Últimos tickets impresos
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Reimprimir no cambia la fecha original de impresión.
            </p>
          </div>
          <PrintedTicketsList
            canPrintTickets={canPrintTickets}
            onOpen={setSelectedSale}
            tickets={printedTickets}
          />
        </section>
      </div>
    </section>
  );
}
