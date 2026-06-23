"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { CloseDailyCutModal } from "@/components/caja/corte-dia/CloseDailyCutModal";
import { DailyClosureStatus } from "@/components/caja/corte-dia/DailyClosureStatus";
import { DailyCustomerTypeBreakdown } from "@/components/caja/corte-dia/DailyCustomerTypeBreakdown";
import { DailyCutPrintView } from "@/components/caja/corte-dia/DailyCutPrintView";
import { DailyCutSummaryCards } from "@/components/caja/corte-dia/DailyCutSummaryCards";
import { DailyFinancialBreakdown } from "@/components/caja/corte-dia/DailyFinancialBreakdown";
import { DailyPrintSummary } from "@/components/caja/corte-dia/DailyPrintSummary";
import { DailyUserBreakdown } from "@/components/caja/corte-dia/DailyUserBreakdown";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth/permissions";
import { formatDateTimeMx } from "@/lib/formatters/date";
import {
  closeDailyCashClosure,
  getDailySalesSummary,
  getMexicoTodayDate,
  subscribeToDailyCutChanges,
} from "@/lib/modules/corte-dia/service";
import type { DailyCutData } from "@/lib/modules/corte-dia/types";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se pudo cargar el corte del día.";
}

export function DailyCutPage() {
  const { user } = useAuth();
  const canCloseCut = isAdmin(user);
  const [selectedDate, setSelectedDate] = React.useState(getMexicoTodayDate);
  const [data, setData] = React.useState<DailyCutData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = React.useState(false);
  const [isSavingClosure, setIsSavingClosure] = React.useState(false);
  const [error, setError] = React.useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<Date | null>(null);
  const [message, setMessage] = React.useState("");
  const lastRealtimeMessageAtRef = React.useRef(0);

  const loadData = React.useCallback(
    async (showLoader: boolean, showUpdatedMessage = false) => {
      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const nextData = await getDailySalesSummary(selectedDate);
        setData(nextData);
        setLastUpdatedAt(new Date());
        setError("");

        if (showUpdatedMessage) {
          const now = Date.now();
          if (now - lastRealtimeMessageAtRef.current > 5000) {
            setMessage("Corte actualizado.");
            lastRealtimeMessageAtRef.current = now;
          }
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedDate]
  );

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData(true);
    }, 0);

    const unsubscribe = subscribeToDailyCutChanges(() => {
      void loadData(false, true);
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [loadData]);

  async function handleSaveClosure(input: {
    countedCashTotal: number;
    notes: string | null;
  }) {
    setIsSavingClosure(true);
    setError("");
    setMessage("");

    try {
      await closeDailyCashClosure({
        businessDate: selectedDate,
        countedCashTotal: input.countedCashTotal,
        notes: input.notes,
      });
      setIsCloseModalOpen(false);
      await loadData(false);
      setMessage("Corte del día guardado correctamente.");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSavingClosure(false);
    }
  }

  const summary = data?.summary;

  function handlePrintCut() {
    document.documentElement.classList.add("printing-daily-cut");
    document.body.classList.add("printing-daily-cut");
    window.print();
    window.setTimeout(() => {
      document.documentElement.classList.remove("printing-daily-cut");
      document.body.classList.remove("printing-daily-cut");
    }, 500);
  }

  return (
    <section className="brand-workspace rounded-lg p-3 text-[#1F2933] sm:p-5">
      <CloseDailyCutModal
        existingClosure={data?.closure ?? null}
        expectedCashTotal={summary?.grandTotal ?? 0}
        isOpen={isCloseModalOpen}
        isSaving={isSavingClosure}
        onClose={() => setIsCloseModalOpen(false)}
        onSave={(input) => void handleSaveClosure(input)}
      />

      {data ? (
        <DailyCutPrintView data={data} lastUpdatedAt={lastUpdatedAt} />
      ) : null}

      <div className="no-print mb-5 rounded-lg border border-[#E8DFC6] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#0B7A3B]">
              Caja
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1F2933] sm:text-3xl">
              Corte del Día
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Resumen de ventas, efectivo esperado y actividad del día.
            </p>
            <p className="mt-1 text-xs font-semibold text-[#6B7280]">
              Última actualización:{" "}
              {lastUpdatedAt ? formatDateTimeMx(lastUpdatedAt) : "Sin cargar"}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,12rem)_auto_auto_auto] sm:items-end">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#1F2933]">
                Fecha
              </span>
              <input
                className="h-11 w-full rounded-md border border-[#E8DFC6] bg-white px-3 text-sm font-semibold outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
                onChange={(event) => setSelectedDate(event.target.value)}
                type="date"
                value={selectedDate}
              />
            </label>
            <Button
              className="h-11 w-full border-[#0B7A3B] bg-white px-4 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
              disabled={isRefreshing}
              onClick={() => void loadData(false)}
              type="button"
              variant="outline"
            >
              Actualizar
            </Button>
            {canCloseCut ? (
              <Button
                className="h-11 w-full bg-[#D92D20] px-4 font-bold text-white hover:bg-[#B42318]"
                onClick={() => setIsCloseModalOpen(true)}
                type="button"
              >
                {data?.closure ? "Actualizar corte" : "Cerrar corte"}
              </Button>
            ) : null}
            {canCloseCut ? (
              <Button
                className="h-11 w-full border-[#0B7A3B] bg-white px-4 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
                disabled={!data}
                onClick={handlePrintCut}
                type="button"
                variant="outline"
              >
                Imprimir corte
              </Button>
            ) : null}
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

      {isLoading || !data || !summary ? (
        <div className="rounded-md border border-[#E8DFC6] bg-white px-4 py-6 text-sm font-semibold text-[#6B7280] shadow-sm">
          Cargando corte del día...
        </div>
      ) : (
        <div className="grid gap-5">
          {summary.salesCount === 0 ? (
            <div className="rounded-md border border-[#E8DFC6] bg-white px-4 py-3 text-sm text-[#6B7280] shadow-sm">
              No hay ventas registradas para esta fecha.
            </div>
          ) : null}

          <DailyCutSummaryCards summary={summary} />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="grid gap-5">
              <DailyFinancialBreakdown summary={summary} />
              <DailyUserBreakdown rows={data.userBreakdown} />
              <DailyCustomerTypeBreakdown
                rows={data.customerTypeBreakdown}
              />
            </div>

            <div className="grid content-start gap-5">
              <DailyPrintSummary summary={summary} />
              <DailyClosureStatus closure={data.closure} summary={summary} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
