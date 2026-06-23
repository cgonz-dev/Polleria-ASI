import type { CurrentAppUser } from "@/lib/auth/types";

export function isAdmin(user: CurrentAppUser | null): boolean {
  return user?.role === "ADMIN";
}

export function canPrintTickets(user: CurrentAppUser | null): boolean {
  return user?.canPrintTickets === true;
}
