import { createSupabaseClient } from "@/lib/supabase/client";
import type { BusinessSettings, PremiumCustomer } from "@/lib/supabase/types";
import type {
  CreatePlumaSaleInput,
  CreatePlumaSaleResult,
} from "@/lib/modules/ventas-pluma/types";

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error("No se pudo cargar la configuración del negocio.");
  }

  return data;
}

export async function getActivePremiumCustomers(): Promise<PremiumCustomer[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("premium_customers")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar los clientes premium activos.");
  }

  return data ?? [];
}

export async function createPlumaSale(
  input: CreatePlumaSaleInput
): Promise<CreatePlumaSaleResult> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("pluma_sales")
    .insert({
      applied_price_per_kg: input.appliedPricePerKg,
      base_price_per_kg: input.basePricePerKg,
      cashier_user_id: input.cashierUserId,
      chicken_quantity: input.chickenQuantity,
      chicken_subtotal: input.chickenSubtotal,
      customer_id: input.customerId,
      customer_name_snapshot: input.customerNameSnapshot,
      discount_per_kg: input.discountPerKg,
      grand_total: input.grandTotal,
      payment_method: "EFECTIVO",
      preparation_total: input.preparationTotal,
      preparation_unit_price: input.preparationUnitPrice,
      status: "COMPLETADA",
      total_weight_kg: input.totalWeightKg,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("No se pudo registrar la venta. Intenta de nuevo.");
  }

  return data;
}
