import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import type { PlumaSale } from "@/lib/supabase/types";

export type PendingTicketCounters = {
  pending: number;
};

export type PlumaSalePrintChangePayload =
  RealtimePostgresChangesPayload<PlumaSale>;

export function isPendingPrintSale(sale: PlumaSale | null): sale is PlumaSale {
  return sale?.status === "COMPLETADA" && sale.printed_at == null;
}

export function isPrintedSale(sale: PlumaSale | null): sale is PlumaSale {
  return sale?.status === "COMPLETADA" && sale.printed_at != null;
}
