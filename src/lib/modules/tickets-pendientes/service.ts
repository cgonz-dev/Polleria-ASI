import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { PlumaSale } from "@/lib/supabase/types";
import type { PlumaSalePrintChangePayload } from "@/lib/modules/tickets-pendientes/types";

function buildTicketError(message: string, details?: string) {
  return new Error(
    details
      ? `${message} Detalle: ${details}. Revisa que docs/database/006-print-tracking-pluma-sales.sql esté ejecutada.`
      : message
  );
}

export async function getPendingPlumaTickets(): Promise<PlumaSale[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("pluma_sales")
    .select("*")
    .eq("status", "COMPLETADA")
    .is("printed_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw buildTicketError(
      "No se pudieron cargar los tickets pendientes.",
      error.message
    );
  }

  return data ?? [];
}

export async function getPrintedPlumaTickets(limit = 20): Promise<PlumaSale[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("pluma_sales")
    .select("*")
    .eq("status", "COMPLETADA")
    .not("printed_at", "is", null)
    .order("printed_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw buildTicketError(
      "No se pudieron cargar los tickets impresos.",
      error.message
    );
  }

  return data ?? [];
}

export async function getPendingPlumaTicketsCount(): Promise<number> {
  const supabase = createBrowserSupabaseClient();
  const { count, error } = await supabase
    .from("pluma_sales")
    .select("id", { count: "exact", head: true })
    .eq("status", "COMPLETADA")
    .is("printed_at", null);

  if (error) {
    throw buildTicketError(
      "No se pudo cargar el contador de tickets pendientes.",
      error.message
    );
  }

  return count ?? 0;
}

export async function markPlumaSalePrinted(
  saleId: string
): Promise<PlumaSale> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.rpc("mark_pluma_sale_printed", {
    p_sale_id: saleId,
  });

  if (error || !data) {
    throw buildTicketError(
      "No se pudo marcar el ticket como impreso.",
      error?.message
    );
  }

  return data;
}

export function subscribeToPlumaSalesPrintChanges(
  callback: (payload: PlumaSalePrintChangePayload) => void
) {
  const supabase = createBrowserSupabaseClient();
  const channel = supabase
    .channel("pluma-sales-print-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pluma_sales",
      },
      callback
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
