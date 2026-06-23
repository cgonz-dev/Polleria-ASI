import type { Session } from "@supabase/supabase-js";

import type { CurrentAppUser } from "@/lib/auth/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { AppUser } from "@/lib/supabase/types";

function mapAppUser(profile: AppUser): CurrentAppUser | null {
  if (!profile.auth_user_id || !profile.active) {
    return null;
  }

  return {
    active: profile.active,
    authUserId: profile.auth_user_id,
    canPrintTickets: profile.can_print_tickets,
    email: profile.email,
    id: profile.id,
    name: profile.name,
    role: profile.role,
    username: profile.username,
  };
}

export async function getCurrentAppUser(
  existingSession?: Session | null
): Promise<CurrentAppUser | null> {
  const supabase = createBrowserSupabaseClient();
  const session =
    existingSession ??
    (await supabase.auth.getSession()).data.session;

  if (!session) {
    return null;
  }

  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("auth_user_id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapAppUser(data);
}
