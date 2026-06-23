import type { DailyCashClosure, PlumaSale } from "@/lib/supabase/types";

export type MexicoDayRange = {
  endIso: string;
  startIso: string;
};

export type DailySalesSummary = {
  breastFilletTotal: number;
  chickenSubtotal: number;
  extraServicesTotal: number;
  grandTotal: number;
  pendingPrintCount: number;
  preparationTotal: number;
  printedCount: number;
  salesCount: number;
  skinningTotal: number;
  totalChickens: number;
  totalWeightKg: number;
};

export type DailyUserBreakdownRow = {
  cashierUserId: string | null;
  name: string;
  salesCount: number;
  totalChickens: number;
  totalWeightKg: number;
  grandTotal: number;
};

export type CustomerTypeKey = "PUBLICO_GENERAL" | "CLIENTE_PREFERENCIAL";

export type DailyCustomerTypeBreakdownRow = {
  customerType: CustomerTypeKey;
  label: string;
  salesCount: number;
  totalChickens: number;
  totalWeightKg: number;
  grandTotal: number;
};

export type DailyClosureSnapshot = DailyCashClosure & {
  closedByName: string | null;
};

export type DailyCutData = {
  businessDate: string;
  closure: DailyClosureSnapshot | null;
  customerTypeBreakdown: DailyCustomerTypeBreakdownRow[];
  range: MexicoDayRange;
  sales: PlumaSale[];
  summary: DailySalesSummary;
  userBreakdown: DailyUserBreakdownRow[];
};

export type CloseDailyCashClosureInput = {
  businessDate: string;
  countedCashTotal: number;
  notes: string | null;
};
