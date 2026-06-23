import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { BusinessSettings, PremiumCustomer } from "@/lib/supabase/types";
import type { PreferredCustomerFormInput } from "@/lib/modules/clientes-preferenciales/types";

export async function getLatestBusinessSettings(): Promise<BusinessSettings> {
  const supabase = createBrowserSupabaseClient();
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

export async function getPreferredCustomers(): Promise<PremiumCustomer[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("premium_customers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar los clientes preferenciales.");
  }

  return data ?? [];
}

export async function createPreferredCustomer(
  input: PreferredCustomerFormInput
): Promise<PremiumCustomer> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("premium_customers")
    .insert({
      active: input.active,
      breast_fillet_price_per_chicken: input.breastFilletPricePerChicken,
      discount_per_kg: 0,
      name: input.name.trim(),
      notes: input.notes,
      phone: input.phone,
      preferred_price_per_kg: input.preferredPricePerKg,
      skinning_price_per_chicken: input.skinningPricePerChicken,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("No se pudo crear el cliente preferencial.");
  }

  return data;
}

export async function updatePreferredCustomer(
  customerId: string,
  input: PreferredCustomerFormInput
): Promise<PremiumCustomer> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("premium_customers")
    .update({
      active: input.active,
      breast_fillet_price_per_chicken: input.breastFilletPricePerChicken,
      name: input.name.trim(),
      notes: input.notes,
      phone: input.phone,
      preferred_price_per_kg: input.preferredPricePerKg,
      skinning_price_per_chicken: input.skinningPricePerChicken,
    })
    .eq("id", customerId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("No se pudo actualizar el cliente preferencial.");
  }

  return data;
}
