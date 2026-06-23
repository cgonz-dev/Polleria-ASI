"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatters/money";
import type { DailyClosureSnapshot } from "@/lib/modules/corte-dia/types";

type CloseDailyCutModalProps = {
  expectedCashTotal: number;
  isOpen: boolean;
  isSaving: boolean;
  existingClosure: DailyClosureSnapshot | null;
  onClose: () => void;
  onSave: (input: { countedCashTotal: number; notes: string | null }) => void;
};

function parseMoneyInput(value: string) {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return 0;
  }

  return Number(normalized);
}

export function CloseDailyCutModal({
  expectedCashTotal,
  existingClosure,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: CloseDailyCutModalProps) {
  const [countedCashInput, setCountedCashInput] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      const timeoutId = window.setTimeout(() => {
        setCountedCashInput(
          existingClosure
            ? String(existingClosure.counted_cash_total.toFixed(2))
            : String(expectedCashTotal.toFixed(2))
        );
        setNotes(existingClosure?.notes ?? "");
        setError("");
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, [existingClosure, expectedCashTotal, isOpen]);

  if (!isOpen) {
    return null;
  }

  const countedCashTotal = parseMoneyInput(countedCashInput);
  const difference = countedCashTotal - expectedCashTotal;
  const differenceLabel =
    difference < 0 ? "Faltante" : difference > 0 ? "Sobrante" : "Diferencia";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!Number.isFinite(countedCashTotal) || countedCashTotal < 0) {
      setError("Ingresa un efectivo contado válido.");
      return;
    }

    onSave({
      countedCashTotal,
      notes: notes.trim() ? notes.trim() : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3">
      <form
        className="w-full max-w-lg rounded-lg border border-[#E8DFC6] bg-white p-5 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="text-sm font-black uppercase text-[#0B7A3B]">
            Cerrar corte del día
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#1F2933]">
            Guardar cierre
          </h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            El sistema guardará una fotografía de los totales actuales.
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] p-4">
            <p className="text-sm text-[#6B7280]">Efectivo esperado</p>
            <p className="mt-1 text-3xl font-black text-[#D92D20]">
              {formatMoney(expectedCashTotal)}
            </p>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#1F2933]">
              Efectivo contado
            </span>
            <input
              className="h-12 rounded-md border border-[#E8DFC6] bg-white px-3 text-lg font-semibold outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
              inputMode="decimal"
              min="0"
              onChange={(event) => setCountedCashInput(event.target.value)}
              step="0.01"
              type="number"
              value={countedCashInput}
            />
          </label>

          <div className="rounded-md border border-[#E8DFC6] bg-[#FAF7EF] p-4">
            <p className="text-sm font-black text-[#1F2933]">
              {differenceLabel}
            </p>
            <p
              className={
                difference < 0
                  ? "mt-1 text-2xl font-black text-[#D92D20]"
                  : "mt-1 text-2xl font-black text-[#0B7A3B]"
              }
            >
              {formatMoney(difference)}
            </p>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#1F2933]">
              Notas opcionales
            </span>
            <textarea
              className="min-h-24 rounded-md border border-[#E8DFC6] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0B7A3B] focus:ring-4 focus:ring-[#0B7A3B]/15"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ej. Se deja cambio para apertura."
              value={notes}
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-[#D92D20]/30 bg-white px-3 py-2 text-sm font-semibold text-[#D92D20]">
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            className="h-11 border-[#0B7A3B] bg-white px-4 font-bold text-[#0B7A3B] hover:bg-[#EAF7EE]"
            disabled={isSaving}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            className="h-11 bg-[#D92D20] px-4 font-bold text-white hover:bg-[#B42318]"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Guardando..." : "Guardar cierre"}
          </Button>
        </div>
      </form>
    </div>
  );
}
