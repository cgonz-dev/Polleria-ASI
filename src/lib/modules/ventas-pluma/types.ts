import type {
  BusinessSettings,
  PlumaSale,
  PlumaWeightType,
  PremiumCustomer,
} from "@/lib/supabase/types";

export type CustomerType = "PUBLICO_GENERAL" | "CLIENTE_PREFERENCIAL";
export type SaleCustomerMode = "PUBLIC_GENERAL" | "PREFERRED_CUSTOMER";

export type PlumaSaleCalculationInput = {
  customerMode: SaleCustomerMode;
  chickenQuantity: number;
  totalWeightKg: number;
  publicPricePerKg: number;
  preparationPricePerChicken: number;
  preferredPricePerKg?: number;
  skinningRequested?: boolean;
  skinningPricePerChicken?: number;
  breastFilletRequested?: boolean;
  breastFilletPricePerChicken?: number;
};

export type PlumaSaleCalculationResult = {
  weightType: PlumaWeightType;
  preparationApplies: boolean;
  appliedPricePerKg: number;
  chickenSubtotal: number;
  preparationTotal: number;
  skinningRequested: boolean;
  skinningUnitPrice: number;
  skinningTotal: number;
  breastFilletRequested: boolean;
  breastFilletUnitPrice: number;
  breastFilletTotal: number;
  extraServicesTotal: number;
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
  weightType: PlumaWeightType;
  preparationApplies: boolean;
  skinningRequested: boolean;
  skinningUnitPrice: number;
  skinningTotal: number;
  breastFilletRequested: boolean;
  breastFilletUnitPrice: number;
  breastFilletTotal: number;
  extraServicesTotal: number;
  grandTotal: number;
};

export type CreatePlumaSaleResult = PlumaSale;

export type PlumaSaleInitialData = {
  businessSettings: BusinessSettings;
  preferredCustomers: PremiumCustomer[];
};
