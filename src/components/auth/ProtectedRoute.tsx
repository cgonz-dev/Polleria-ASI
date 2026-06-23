"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { UnauthorizedState } from "@/components/auth/UnauthorizedState";
import { isAdmin } from "@/lib/auth/permissions";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user } = useAuth();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status, pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm font-semibold text-[#6B7280]">
        Validando sesión...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (requireAdmin && !isAdmin(user)) {
    return <UnauthorizedState />;
  }

  return <>{children}</>;
}
