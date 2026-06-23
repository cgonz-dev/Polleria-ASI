import type { PlumaSale } from "@/lib/supabase/types";
import { formatDateTimeMx } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";
import { formatKg } from "@/lib/formatters/weight";

type PlumaSaleTicketProps = {
  businessName: string;
  businessPhone: string;
  sale: PlumaSale;
};

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ticket-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const FALLBACK_BUSINESS_PHONE = "456-106-0141";

export function PlumaSaleTicket({
  businessName,
  businessPhone,
  sale,
}: PlumaSaleTicketProps) {
  const displayBusinessName =
    businessName.trim().length > 0
      ? businessName.trim().toLocaleUpperCase("es-MX")
      : "POLLERÍA ASI";
  const displayBusinessPhone =
    businessPhone.trim().length > 0 && businessPhone.trim() !== "000-000-0000"
      ? businessPhone.trim()
      : FALLBACK_BUSINESS_PHONE;
  const customerName = sale.customer_name_snapshot?.trim();
  const shouldShowCustomer =
    customerName !== undefined &&
    customerName.length > 0 &&
    customerName.toLowerCase() !== "público general";
  const chickenLabel = sale.chicken_quantity === 1 ? "pollo" : "pollos";

  return (
    <article className="ticket-print-area">
      <div className="ticket-header">
        <p className="ticket-business">{displayBusinessName}</p>
        <p className="ticket-phone">Tel: {displayBusinessPhone}</p>
      </div>

      <div className="ticket-separator" />

      <p className="ticket-title">VENTA POLLO EN PLUMA</p>
      <TicketRow label="Ticket:" value={sale.sale_number} />
      <TicketRow label="Fecha:" value={formatDateTimeMx(sale.created_at)} />

      {shouldShowCustomer ? (
        <TicketRow label="Cliente:" value={customerName} />
      ) : null}

      <div className="ticket-separator" />

      <TicketRow label="Pollos:" value={String(sale.chicken_quantity)} />
      <TicketRow label="Peso total:" value={formatKg(sale.total_weight_kg)} />

      <div className="ticket-separator" />

      <TicketRow
        label="Precio por kg:"
        value={`${formatMoney(sale.applied_price_per_kg)}/kg`}
      />

      <div className="ticket-separator" />

      <TicketRow
        label="Pollo en pluma:"
        value={formatMoney(sale.chicken_subtotal)}
      />

      <p className="ticket-section-label">Preparación:</p>
      <TicketRow
        label={`${sale.chicken_quantity} ${chickenLabel} x ${formatMoney(
          sale.preparation_unit_price
        )}`}
        value={formatMoney(sale.preparation_total)}
      />

      <div className="ticket-separator" />

      <div className="ticket-total">
        <span>TOTAL:</span>
        <span>{formatMoney(sale.grand_total)}</span>
      </div>

      <p className="ticket-thanks">Gracias por su compra</p>
    </article>
  );
}
