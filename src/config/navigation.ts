import {
  Banknote,
  LayoutDashboard,
  ReceiptText,
  Settings,
  ShoppingCart,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavigationChild = {
  href: string;
  icon: LucideIcon;
  title: string;
};

type NavigationSection = {
  children: NavigationChild[];
  href?: string;
  icon: LucideIcon;
  title: string;
};

export const mainNavigation = [
  {
    children: [],
    href: "/dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
  },
  {
    children: [
      {
        href: "/ventas/pluma",
        icon: ShoppingCart,
        title: "Venta en Pluma",
      },
    ],
    icon: ShoppingCart,
    title: "Ventas",
  },
  {
    children: [
      {
        href: "/clientes/preferenciales",
        icon: Users,
        title: "Clientes Preferenciales",
      },
    ],
    icon: Users,
    title: "Clientes",
  },
  {
    children: [
      {
        href: "/caja/tickets-pendientes",
        icon: ReceiptText,
        title: "Tickets pendientes",
      },
      {
        href: "/caja/corte-dia",
        icon: Banknote,
        title: "Corte del Día",
      },
    ],
    icon: Banknote,
    title: "Caja",
  },
  {
    children: [
      {
        href: "/admin/usuarios",
        icon: UserCog,
        title: "Usuarios",
      },
      {
        href: "/admin/configuracion",
        icon: Settings,
        title: "Configuración",
      },
    ],
    icon: Settings,
    title: "Administración",
  },
] satisfies NavigationSection[];
