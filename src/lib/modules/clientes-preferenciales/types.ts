import type { BusinessSettings, PremiumCustomer } from "@/lib/supabase/types";

export type PreferredCustomer = PremiumCustomer;

export type PreferredCustomerDefaults = {
  preferredPricePerKg: number;
  skinningPricePerChicken: number;
  breastFilletPricePerChicken: number;
};

export type PreferredCustomerFormInput = {
  name: string;
  phone: string | null;
  preferredPricePerKg: number;
  skinningPricePerChicken: number;
  breastFilletPricePerChicken: number;
  active: boolean;
  notes: string | null;
};

export function getPreferredCustomerDefaults(
  settings: BusinessSettings
): PreferredCustomerDefaults {
  return {
    breastFilletPricePerChicken:
      settings.default_breast_fillet_price_per_chicken ?? 0,
    preferredPricePerKg:
      settings.preferred_customer_default_price_per_kg ??
      settings.current_price_per_kg,
    skinningPricePerChicken: settings.default_skinning_price_per_chicken ?? 0,
  };
}
