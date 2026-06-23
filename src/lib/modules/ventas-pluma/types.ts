import type {
  BusinessSettings,
  PlumaSale,
  PremiumCustomer,
} from "@/lib/supabase/types";

export type CustomerType = "PUBLICO_GENERAL" | "CLIENTE_PREMIUM";

export type PlumaSaleCalculationInput = {
  chickenQuantity: number;
  totalWeightKg: number;
  basePricePerKg: number;
  discountPerKg: number;
  preparationUnitPrice: number;
};

export type PlumaSaleCalculationResult = {
  appliedPricePerKg: number;
  chickenSubtotal: number;
  preparationTotal: number;
  grandTotal: number;
};

export type CreatePlumaSaleInput = {
  customerId: string | null;
  customerNameSnapshot: string;
  cashierUserId: string;
  chickenQuantity: number;
  totalWeightKg: number;
  basePricePerKg: number;
  discountPerKg: number;
  appliedPricePerKg: number;
  chickenSubtotal: number;
  preparationUnitPrice: number;
  preparationTotal: number;
  grandTotal: number;
};

export type CreatePlumaSaleResult = PlumaSale;

export type PlumaSaleInitialData = {
  businessSettings: BusinessSettings;
  premiumCustomers: PremiumCustomer[];
};
