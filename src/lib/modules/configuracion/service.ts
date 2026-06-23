import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { BusinessSettings } from "@/lib/supabase/types";
import type { BusinessSettingsFormInput } from "@/lib/modules/configuracion/types";

export async function getBusinessSettingsForAdmin(): Promise<BusinessSettings> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error("No se pudo cargar la configuración.");
  }

  return data;
}

export async function updateBusinessSettings(
  settingsId: string,
  input: BusinessSettingsFormInput
): Promise<BusinessSettings> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("business_settings")
    .update({
      business_name: input.businessName.trim(),
      current_price_per_kg: input.currentPricePerKg,
      default_breast_fillet_price_per_chicken:
        input.defaultBreastFilletPricePerChicken,
      default_skinning_price_per_chicken: input.defaultSkinningPricePerChicken,
      phone: input.phone.trim(),
      preparation_price_per_chicken: input.preparationPricePerChicken,
      preferred_customer_default_price_per_kg:
        input.preferredCustomerDefaultPricePerKg,
    })
    .eq("id", settingsId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("No se pudo guardar la configuración.");
  }

  return data;
}
