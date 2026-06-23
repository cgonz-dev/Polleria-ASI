export const APP_USER_ROLES = ["ADMIN", "CAJERO"] as const;
export const PLUMA_PAYMENT_METHODS = ["EFECTIVO"] as const;
export const PLUMA_SALE_STATUSES = ["COMPLETADA", "CANCELADA"] as const;

export type AppUserRole = (typeof APP_USER_ROLES)[number];
export type PlumaPaymentMethod = (typeof PLUMA_PAYMENT_METHODS)[number];
export type PlumaSaleStatus = (typeof PLUMA_SALE_STATUSES)[number];

export type BusinessSettings = {
  id: string;
  business_name: string;
  phone: string;
  current_price_per_kg: number;
  preparation_price_per_chicken: number;
  created_at: string;
  updated_at: string;
};

export type AppUser = {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string | null;
  username: string | null;
  role: AppUserRole;
  active: boolean;
  can_print_tickets: boolean;
  created_at: string;
  updated_at: string;
};

export type PremiumCustomer = {
  id: string;
  name: string;
  phone: string | null;
  discount_per_kg: number;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PlumaSale = {
  id: string;
  sale_number: string;
  customer_id: string | null;
  customer_name_snapshot: string | null;
  cashier_user_id: string | null;
  chicken_quantity: number;
  total_weight_kg: number;
  base_price_per_kg: number;
  discount_per_kg: number;
  applied_price_per_kg: number;
  chicken_subtotal: number;
  preparation_unit_price: number;
  preparation_total: number;
  grand_total: number;
  payment_method: PlumaPaymentMethod;
  printed_at: string | null;
  printed_by_user_id: string | null;
  status: PlumaSaleStatus;
  created_at: string;
};

export type PlumaSaleCancellation = {
  id: string;
  sale_id: string;
  cancelled_by_user_id: string | null;
  reason: string;
  created_at: string;
};

export type DailyCashClosure = {
  id: string;
  business_date: string;
  expected_cash_total: number;
  counted_cash_total: number;
  cash_difference: number;
  sales_count: number;
  total_chickens: number;
  total_weight_kg: number;
  chicken_subtotal: number;
  preparation_total: number;
  grand_total: number;
  pending_print_count: number;
  printed_count: number;
  closed_by_user_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InsertBusinessSettings = {
  id?: string;
  business_name: string;
  phone: string;
  current_price_per_kg: number;
  preparation_price_per_chicken?: number;
  created_at?: string;
  updated_at?: string;
};

export type InsertAppUser = {
  id?: string;
  auth_user_id?: string | null;
  name: string;
  email?: string | null;
  username?: string | null;
  role: AppUserRole;
  active?: boolean;
  can_print_tickets?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type InsertPremiumCustomer = {
  id?: string;
  name: string;
  phone?: string | null;
  discount_per_kg?: number;
  active?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type InsertPlumaSale = {
  id?: string;
  sale_number?: string;
  customer_id?: string | null;
  customer_name_snapshot?: string | null;
  cashier_user_id?: string | null;
  chicken_quantity: number;
  total_weight_kg: number;
  base_price_per_kg: number;
  discount_per_kg?: number;
  applied_price_per_kg: number;
  chicken_subtotal: number;
  preparation_unit_price: number;
  preparation_total: number;
  grand_total: number;
  payment_method?: PlumaPaymentMethod;
  printed_at?: string | null;
  printed_by_user_id?: string | null;
  status?: PlumaSaleStatus;
  created_at?: string;
};

export type InsertPlumaSaleCancellation = {
  id?: string;
  sale_id: string;
  cancelled_by_user_id?: string | null;
  reason: string;
  created_at?: string;
};

export type InsertDailyCashClosure = {
  id?: string;
  business_date: string;
  expected_cash_total: number;
  counted_cash_total: number;
  cash_difference: number;
  sales_count: number;
  total_chickens: number;
  total_weight_kg: number;
  chicken_subtotal: number;
  preparation_total: number;
  grand_total: number;
  pending_print_count: number;
  printed_count: number;
  closed_by_user_id: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

type TableDefinition<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      business_settings: TableDefinition<
        BusinessSettings,
        InsertBusinessSettings,
        Partial<InsertBusinessSettings>
      >;
      app_users: TableDefinition<AppUser, InsertAppUser, Partial<InsertAppUser>>;
      premium_customers: TableDefinition<
        PremiumCustomer,
        InsertPremiumCustomer,
        Partial<InsertPremiumCustomer>
      >;
      pluma_sales: TableDefinition<PlumaSale, InsertPlumaSale, Partial<InsertPlumaSale>>;
      pluma_sale_cancellations: TableDefinition<
        PlumaSaleCancellation,
        InsertPlumaSaleCancellation,
        Partial<InsertPlumaSaleCancellation>
      >;
      daily_cash_closures: TableDefinition<
        DailyCashClosure,
        InsertDailyCashClosure,
        Partial<InsertDailyCashClosure>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      mark_pluma_sale_printed: {
        Args: {
          p_sale_id: string;
        };
        Returns: PlumaSale;
      };
      close_daily_cash_closure: {
        Args: {
          p_business_date: string;
          p_counted_cash_total: number;
          p_notes?: string | null;
        };
        Returns: DailyCashClosure;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
