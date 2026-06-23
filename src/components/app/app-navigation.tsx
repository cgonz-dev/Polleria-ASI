"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { mainNavigation } from "@/config/navigation";
import { isAdmin } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const canSeeAdmin = isAdmin(user);

  return (
    <nav aria-label="Menú principal" className="space-y-5">
      {mainNavigation.map((item) => {
        if (item.title === "Administración" && !canSeeAdmin) {
          return null;
        }

        const Icon = item.icon;
        const hasChildren = item.children.length > 0;
        const isSectionActive =
          item.href !== undefined
            ? isActivePath(pathname, item.href)
            : item.children.some((child) => isActivePath(pathname, child.href));

        if (!hasChildren && item.href) {
          return (
            <Link
              className={cn(
                "flex h-10 items-center gap-2 rounded-md border border-transparent px-3 text-sm font-semibold text-[#6B7280] transition-colors hover:border-[#E8DFC6] hover:bg-[#EAF7EE] hover:text-[#0B7A3B]",
                isSectionActive &&
                  "border-[#0B7A3B]/20 bg-[#EAF7EE] text-[#0B7A3B] shadow-sm hover:bg-[#EAF7EE] hover:text-[#0B7A3B]"
              )}
              href={item.href}
              key={item.title}
              onClick={onNavigate}
            >
              <Icon className="size-4" />
              {item.title}
            </Link>
          );
        }

        return (
          <div className="space-y-1" key={item.title}>
            <div
              className={cn(
                "flex h-8 items-center gap-2 px-3 text-xs font-black uppercase tracking-wide text-[#6B7280]",
                isSectionActive && "text-[#0B7A3B]"
              )}
            >
              <Icon className="size-4" />
              {item.title}
            </div>
            <div className="space-y-1 pl-4">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildActive = isActivePath(pathname, child.href);

                return (
                  <Link
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-md border border-transparent px-3 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#E8DFC6] hover:bg-[#EAF7EE] hover:text-[#0B7A3B]",
                      isChildActive &&
                        "border-[#0B7A3B]/20 bg-[#EAF7EE] font-bold text-[#0B7A3B] shadow-sm hover:bg-[#EAF7EE] hover:text-[#0B7A3B]"
                    )}
                    href={child.href}
                    key={child.href}
                    onClick={onNavigate}
                  >
                    <ChildIcon className="size-4" />
                    {child.title}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
