import type { PlumaSaleCalculationResult } from "@/lib/modules/ventas-pluma/types";
import { formatKg, formatMoney } from "@/components/ventas-pluma/formatters";

type PlumaSaleSummaryProps = {
  attendantName: string;
  basePricePerKg: number;
  calculation: PlumaSaleCalculationResult;
  chickenQuantity: number;
  customerName: string;
  discountPerKg: number;
  preparationUnitPrice: number;
  totalWeightKg: number;
};

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E8DFC6] py-2 last:border-b-0">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className="text-right text-sm font-semibold text-[#1F2933]">
        {value}
      </span>
    </div>
  );
}

export function PlumaSaleSummary({
  attendantName,
  basePricePerKg,
  calculation,
  chickenQuantity,
  customerName,
  discountPerKg,
  preparationUnitPrice,
  totalWeightKg,
}: PlumaSaleSummaryProps) {
  return (
    <aside className="no-print rounded-lg border border-[#E8DFC6] bg-white shadow-sm lg:sticky lg:top-24">
      <div className="rounded-t-md bg-[#0B7A3B] px-5 py-4 text-white">
        <p className="text-sm font-medium uppercase tracking-wide">
          Resumen de venta
        </p>
        <h2 className="mt-1 text-xl font-semibold">Venta en Pluma</h2>
      </div>

      <div className="grid gap-1 px-5 py-4">
        <SummaryRow label="Cliente" value={customerName} />
        <SummaryRow
          label="Atiende"
          value={attendantName || "Usuario no cargado"}
        />
        <SummaryRow label="Cantidad de pollos" value={chickenQuantity || 0} />
        <SummaryRow label="Peso total" value={formatKg(totalWeightKg)} />
        <SummaryRow label="Precio base por kg" value={`${formatMoney(basePricePerKg)}/kg`} />
        <SummaryRow
          label="Descuento por kg"
          value={`-${formatMoney(discountPerKg)}/kg`}
        />
        <SummaryRow
          label="Precio aplicado por kg"
          value={`${formatMoney(calculation.appliedPricePerKg)}/kg`}
        />
        <SummaryRow
          label="Subtotal pollo"
          value={formatMoney(calculation.chickenSubtotal)}
        />
        <SummaryRow
          label="Preparación"
          value={`${formatMoney(calculation.preparationTotal)} (${formatMoney(
            preparationUnitPrice
          )}/pollo)`}
        />
      </div>

      <div className="border-t border-[#E8DFC6] bg-[#FAF7EF] px-5 py-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[#D92D20]">
          Total a cobrar
        </p>
        <p className="mt-1 text-4xl font-black tracking-tight text-[#D92D20] sm:text-5xl">
          {formatMoney(calculation.grandTotal)}
        </p>
      </div>
    </aside>
  );
}
