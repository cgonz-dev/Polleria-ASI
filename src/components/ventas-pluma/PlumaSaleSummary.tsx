import type {
  CustomerType,
  PlumaSaleCalculationResult,
} from "@/lib/modules/ventas-pluma/types";
import { formatKg, formatMoney } from "@/components/ventas-pluma/formatters";

type PlumaSaleSummaryProps = {
  attendantName: string;
  calculation: PlumaSaleCalculationResult;
  chickenQuantity: number;
  customerType: CustomerType;
  customerName: string;
  preparationUnitPrice: number;
  publicPricePerKg: number;
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
  calculation,
  chickenQuantity,
  customerType,
  customerName,
  preparationUnitPrice,
  publicPricePerKg,
  totalWeightKg,
}: PlumaSaleSummaryProps) {
  const isPreferredCustomer = customerType === "CLIENTE_PREFERENCIAL";

  return (
    <aside className="no-print rounded-lg border border-[#E8DFC6] bg-white shadow-sm lg:sticky lg:top-24">
      <div className="rounded-t-md bg-[#0B7A3B] px-5 py-4 text-white">
        <p className="text-sm font-medium uppercase tracking-wide">
          Resumen de venta
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          {isPreferredCustomer ? "Pollo preparado" : "Venta en Pluma"}
        </h2>
      </div>

      <div className="grid gap-1 px-5 py-4">
        <SummaryRow label="Cliente" value={customerName} />
        <SummaryRow
          label="Atiende"
          value={attendantName || "Usuario no cargado"}
        />
        <SummaryRow label="Cantidad de pollos" value={chickenQuantity || 0} />
        <SummaryRow
          label={isPreferredCustomer ? "Peso ya pelado" : "Peso en pluma"}
          value={formatKg(totalWeightKg)}
        />
        <SummaryRow
          label={
            isPreferredCustomer
              ? "Precio preferencial por kg"
              : "Precio público por kg"
          }
          value={`${formatMoney(calculation.appliedPricePerKg)}/kg`}
        />
        {isPreferredCustomer ? (
          <SummaryRow
            label="Precio público de referencia"
            value={`${formatMoney(publicPricePerKg)}/kg`}
          />
        ) : null}
        <SummaryRow
          label={isPreferredCustomer ? "Pollo preparado" : "Pollo en pluma"}
          value={formatMoney(calculation.chickenSubtotal)}
        />
        {calculation.preparationApplies ? (
          <SummaryRow
            label="Preparación"
            value={`${formatMoney(calculation.preparationTotal)} (${formatMoney(
              preparationUnitPrice
            )}/pollo)`}
          />
        ) : (
          <SummaryRow label="Preparación" value="No aplica" />
        )}
        {calculation.skinningRequested ? (
          <SummaryRow
            label="Despielada"
            value={`${formatMoney(calculation.skinningTotal)} (${formatMoney(
              calculation.skinningUnitPrice
            )}/pollo)`}
          />
        ) : null}
        {calculation.breastFilletRequested ? (
          <SummaryRow
            label="Pechuga fileteada"
            value={`${formatMoney(
              calculation.breastFilletTotal
            )} (${formatMoney(calculation.breastFilletUnitPrice)}/pollo)`}
          />
        ) : null}
        {isPreferredCustomer ? (
          <SummaryRow
            label="Servicios extra"
            value={formatMoney(calculation.extraServicesTotal)}
          />
        ) : null}
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
