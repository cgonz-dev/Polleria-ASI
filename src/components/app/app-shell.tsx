"use client";

import * as React from "react";
import { LogOut, Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { AppNavigation } from "@/components/app/app-navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { canPrintTickets } from "@/lib/auth/permissions";
import type { CurrentAppUser } from "@/lib/auth/types";

function Brand() {
  const [logoAvailable, setLogoAvailable] = React.useState(true);

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 items-center justify-center overflow-hidden rounded-md border border-[#E8DFC6] bg-white shadow-sm">
        {logoAvailable ? (
          // The real logo should be placed at public/brand/logo-asi.png.
          <Image
            alt="Pollería ASI"
            className="max-h-full max-w-full object-contain p-1"
            height={48}
            onError={() => setLogoAvailable(false)}
            src="/brand/logo-asi.png"
            unoptimized
            width={48}
          />
        ) : (
          <span className="text-sm font-black text-[#0B7A3B]">ASI</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-black text-[#0B7A3B]">
          Pollería ASI
        </p>
        <p className="truncate text-xs font-medium text-[#6B7280]">
          Operación diaria
        </p>
      </div>
    </div>
  );
}

function UserSessionCard({
  onSignOut,
  user,
}: {
  onSignOut: () => void;
  user: CurrentAppUser | null;
}) {
  if (!user) {
    return null;
  }

  const printBadge = canPrintTickets(user)
    ? "Impresión habilitada"
    : "Solo captura";

  return (
    <div className="m-3 rounded-md border border-[#E8DFC6] bg-[#FAF7EF] px-4 py-3 text-xs leading-5 text-[#6B7280]">
      <p className="font-bold text-[#0B7A3B]">{user.name}</p>
      <p>{user.role === "ADMIN" ? "Administrador" : "Cajero"}</p>
      <span className="mt-2 inline-flex rounded-full border border-[#0B7A3B]/20 bg-white px-2 py-1 font-bold text-[#0B7A3B]">
        {printBadge}
      </span>
      <Button
        className="mt-3 h-9 w-full border-[#D92D20]/25 bg-white font-bold text-[#D92D20] hover:bg-[#FFF1F0]"
        onClick={onSignOut}
        type="button"
        variant="outline"
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  async function handleSignOut() {
    setMobileOpen(false);
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="brand-app min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[#E8DFC6] bg-white/95 text-[#1F2933] shadow-sm lg:flex">
        <div className="flex h-20 items-center bg-[#FAF7EF] px-5">
          <Brand />
        </div>
        <Separator className="bg-[#E8DFC6]" />
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AppNavigation />
        </div>
        <UserSessionCard onSignOut={handleSignOut} user={user} />
      </aside>

      <div className="lg:pl-72">
        <header className="no-print sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[#E8DFC6] bg-white/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/75 sm:px-6 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={(open) => setMobileOpen(open)}>
            <Button
              aria-expanded={mobileOpen}
              aria-label="Abrir menú"
              aria-controls="mobile-navigation"
              className="relative z-10 size-11 min-h-11 min-w-11 border-[#0B7A3B]/35 text-[#0B7A3B] hover:bg-[#EAF7EE]"
              onClick={() => setMobileOpen(true)}
              size="icon-lg"
              type="button"
              variant="outline"
            >
              <Menu className="size-5" />
            </Button>
            <SheetContent
              className="w-[20rem] bg-white p-0"
              id="mobile-navigation"
              side="left"
            >
              <SheetHeader className="border-b border-[#E8DFC6] bg-[#FAF7EF] p-4">
                <SheetTitle>
                  <Brand />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Menú principal de Pollería ASI
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <AppNavigation onNavigate={() => setMobileOpen(false)} />
              </div>
              <UserSessionCard onSignOut={handleSignOut} user={user} />
            </SheetContent>
          </Sheet>
          <Brand />
        </header>

        <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl px-4 py-6 sm:px-6 lg:min-h-screen lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
