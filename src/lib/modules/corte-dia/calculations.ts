import type {
  AppUser,
  DailyCashClosure,
  PlumaSale,
} from "@/lib/supabase/types";
import type {
  CustomerTypeKey,
  DailyClosureSnapshot,
  DailyCustomerTypeBreakdownRow,
  DailySalesSummary,
  DailyUserBreakdownRow,
} from "@/lib/modules/corte-dia/types";

function emptySummary(): DailySalesSummary {
  return {
    chickenSubtotal: 0,
    grandTotal: 0,
    pendingPrintCount: 0,
    preparationTotal: 0,
    printedCount: 0,
    salesCount: 0,
    totalChickens: 0,
    totalWeightKg: 0,
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundKg(value: number) {
  return Math.round(value * 1000) / 1000;
}

function getFallbackUserName(userId: string | null) {
  return userId ? `Usuario ${userId.slice(0, 8)}` : "Sin usuario";
}

export function buildDailySalesSummary(
  sales: PlumaSale[]
): DailySalesSummary {
  return sales.reduce((summary, sale) => {
    summary.salesCount += 1;
    summary.totalChickens += sale.chicken_quantity;
    summary.totalWeightKg = roundKg(
      summary.totalWeightKg + sale.total_weight_kg
    );
    summary.chickenSubtotal = roundMoney(
      summary.chickenSubtotal + sale.chicken_subtotal
    );
    summary.preparationTotal = roundMoney(
      summary.preparationTotal + sale.preparation_total
    );
    summary.grandTotal = roundMoney(summary.grandTotal + sale.grand_total);

    if (sale.printed_at) {
      summary.printedCount += 1;
    } else {
      summary.pendingPrintCount += 1;
    }

    return summary;
  }, emptySummary());
}

export function buildDailyUserBreakdown(
  sales: PlumaSale[],
  users: AppUser[]
): DailyUserBreakdownRow[] {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const rows = new Map<string, DailyUserBreakdownRow>();

  for (const sale of sales) {
    const key = sale.cashier_user_id ?? "sin-usuario";
    const user = sale.cashier_user_id
      ? usersById.get(sale.cashier_user_id)
      : undefined;
    const existing =
      rows.get(key) ??
      ({
        cashierUserId: sale.cashier_user_id,
        grandTotal: 0,
        name: user?.name ?? getFallbackUserName(sale.cashier_user_id),
        salesCount: 0,
        totalChickens: 0,
        totalWeightKg: 0,
      } satisfies DailyUserBreakdownRow);

    existing.salesCount += 1;
    existing.totalChickens += sale.chicken_quantity;
    existing.totalWeightKg = roundKg(existing.totalWeightKg + sale.total_weight_kg);
    existing.grandTotal = roundMoney(existing.grandTotal + sale.grand_total);
    rows.set(key, existing);
  }

  return [...rows.values()].sort((left, right) => right.grandTotal - left.grandTotal);
}

export function buildDailyCustomerTypeBreakdown(
  sales: PlumaSale[]
): DailyCustomerTypeBreakdownRow[] {
  const initialRows = new Map<CustomerTypeKey, DailyCustomerTypeBreakdownRow>([
    [
      "PUBLICO_GENERAL",
      {
        customerType: "PUBLICO_GENERAL",
        grandTotal: 0,
        label: "Público general",
        salesCount: 0,
        totalChickens: 0,
        totalWeightKg: 0,
      },
    ],
    [
      "CLIENTE_PREMIUM",
      {
        customerType: "CLIENTE_PREMIUM",
        grandTotal: 0,
        label: "Clientes premium",
        salesCount: 0,
        totalChickens: 0,
        totalWeightKg: 0,
      },
    ],
  ]);

  for (const sale of sales) {
    const key: CustomerTypeKey = sale.customer_id
      ? "CLIENTE_PREMIUM"
      : "PUBLICO_GENERAL";
    const row = initialRows.get(key)!;

    row.salesCount += 1;
    row.totalChickens += sale.chicken_quantity;
    row.totalWeightKg = roundKg(row.totalWeightKg + sale.total_weight_kg);
    row.grandTotal = roundMoney(row.grandTotal + sale.grand_total);
  }

  return [...initialRows.values()];
}

export function enrichClosure(
  closure: DailyCashClosure | null,
  users: AppUser[]
): DailyClosureSnapshot | null {
  if (!closure) {
    return null;
  }

  const closedBy = users.find((user) => user.id === closure.closed_by_user_id);

  return {
    ...closure,
    closedByName: closedBy?.name ?? null,
  };
}

export function hasClosureMismatch(
  closure: DailyCashClosure | null,
  summary: DailySalesSummary
) {
  if (!closure) {
    return false;
  }

  return (
    closure.sales_count !== summary.salesCount ||
    closure.total_chickens !== summary.totalChickens ||
    Math.abs(closure.total_weight_kg - summary.totalWeightKg) > 0.001 ||
    Math.abs(closure.chicken_subtotal - summary.chickenSubtotal) > 0.01 ||
    Math.abs(closure.preparation_total - summary.preparationTotal) > 0.01 ||
    Math.abs(closure.grand_total - summary.grandTotal) > 0.01 ||
    closure.pending_print_count !== summary.pendingPrintCount ||
    closure.printed_count !== summary.printedCount
  );
}
