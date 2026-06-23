import type { AppUserRole } from "@/lib/supabase/types";

export type AppRole = AppUserRole;

export type CurrentAppUser = {
  id: string;
  authUserId: string;
  name: string;
  email: string | null;
  username: string | null;
  role: AppRole;
  canPrintTickets: boolean;
  active: boolean;
};
