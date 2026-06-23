import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserSupabaseClient: SupabaseClient<Database> | null = null;

function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return {
    anonKey: supabaseAnonKey,
    url: supabaseUrl,
  };
}

export function createSupabaseClient(): SupabaseClient<Database> {
  if (browserSupabaseClient) {
    return browserSupabaseClient;
  }

  const config = getSupabaseConfig();
  browserSupabaseClient = createClient<Database>(config.url, config.anonKey);

  return browserSupabaseClient;
}

export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  return createSupabaseClient();
}

export function createServerSupabaseClient(): SupabaseClient<Database> {
  return createSupabaseClient();
}
