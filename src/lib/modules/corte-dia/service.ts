import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { AppUser, DailyCashClosure, PlumaSale } from "@/lib/supabase/types";
import {
  buildDailyCustomerTypeBreakdown,
  buildDailySalesSummary,
  buildDailyUserBreakdown,
  enrichClosure,
} from "@/lib/modules/corte-dia/calculations";
import type {
  CloseDailyCashClosureInput,
  DailyCutData,
  MexicoDayRange,
} from "@/lib/modules/corte-dia/types";
import type { PlumaSalePrintChangePayload } from "@/lib/modules/tickets-pendientes/types";

const MEXICO_TIME_ZONE = "America/Mexico_City";

function parseDateString(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error("Fecha inválida.");
  }

  return { day, month, year };
}

function getZonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: MEXICO_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const map = new Map(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(map.get("day")),
    hour: Number(map.get("hour")),
    minute: Number(map.get("minute")),
    month: Number(map.get("month")),
    second: Number(map.get("second")),
    year: Number(map.get("year")),
  };
}

function mexicoLocalTimeToUtc(date: string, hour = 0) {
  const { day, month, year } = parseDateString(date);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, 0, 0);
  const guess = new Date(desiredUtc);
  const zonedParts = getZonedParts(guess);
  const zonedAsUtc = Date.UTC(
    zonedParts.year,
    zonedParts.month - 1,
    zonedParts.day,
    zonedParts.hour,
    zonedParts.minute,
    zonedParts.second
  );

  return new Date(guess.getTime() - (zonedAsUtc - desiredUtc));
}

function addDays(date: string, days: number) {
  const { day, month, year } = parseDateString(date);
  const nextDate = new Date(Date.UTC(year, month - 1, day + days));

  return nextDate.toISOString().slice(0, 10);
}

export function getMexicoTodayDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: MEXICO_TIME_ZONE,
    year: "numeric",
  }).formatToParts(new Date());
  const map = new Map(parts.map((part) => [part.type, part.value]));

  return `${map.get("year")}-${map.get("month")}-${map.get("day")}`;
}

export function getMexicoDayRange(date: string): MexicoDayRange {
  const nextDate = addDays(date, 1);

  return {
    endIso: mexicoLocalTimeToUtc(nextDate).toISOString(),
    startIso: mexicoLocalTimeToUtc(date).toISOString(),
  };
}

async function getUsersByIds(userIds: string[]) {
  if (userIds.length === 0) {
    return [];
  }

  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .in("id", userIds);

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getDailyCashClosure(
  businessDate: string
): Promise<DailyCashClosure | null> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("daily_cash_closures")
    .select("*")
    .eq("business_date", businessDate)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar el cierre del día.");
  }

  return data;
}

export async function getDailySalesSummary(
  businessDate: string
): Promise<DailyCutData> {
  const supabase = createBrowserSupabaseClient();
  const range = getMexicoDayRange(businessDate);
  const [salesResult, closureResult] = await Promise.all([
    supabase
      .from("pluma_sales")
      .select("*")
      .eq("status", "COMPLETADA")
      .gte("created_at", range.startIso)
      .lt("created_at", range.endIso)
      .order("created_at", { ascending: false }),
    getDailyCashClosure(businessDate),
  ]);

  if (salesResult.error) {
    throw new Error("No se pudo cargar el resumen de ventas del día.");
  }

  const sales: PlumaSale[] = salesResult.data ?? [];
  const userIds = [
    ...new Set(
      [
        ...sales.map((sale) => sale.cashier_user_id),
        closureResult?.closed_by_user_id,
      ].filter((id): id is string => Boolean(id))
    ),
  ];
  const users: AppUser[] = await getUsersByIds(userIds);

  return {
    businessDate,
    closure: enrichClosure(closureResult, users),
    customerTypeBreakdown: buildDailyCustomerTypeBreakdown(sales),
    range,
    sales,
    summary: buildDailySalesSummary(sales),
    userBreakdown: buildDailyUserBreakdown(sales, users),
  };
}

export async function closeDailyCashClosure(
  input: CloseDailyCashClosureInput
): Promise<DailyCashClosure> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.rpc("close_daily_cash_closure", {
    p_business_date: input.businessDate,
    p_counted_cash_total: input.countedCashTotal,
    p_notes: input.notes,
  });

  if (error || !data) {
    throw new Error(
      error?.message ?? "No se pudo guardar el cierre del día."
    );
  }

  return data;
}

export function subscribeToDailyCutChanges(
  callback: (payload: PlumaSalePrintChangePayload) => void
) {
  const supabase = createBrowserSupabaseClient();
  const channel = supabase
    .channel("daily-cut-pluma-sales")
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
