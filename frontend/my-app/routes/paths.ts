import { NavItem } from "../app/types/Nav.types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",         href: "/dashboard",         icon: "dashboard" },
  { label: "Inventario",        href: "/inventario",        icon: "inventory_2" },
  { label: "Movimientos",       href: "/movimientos",       icon: "swap_horiz" },
  { label: "Clasificación ABC", href: "/clasificacion-abc", icon: "analytics" },
  { label: "Proveedores",       href: "/proveedores",       icon: "local_shipping" },
  { label: "Reportes",          href: "/reportes",          icon: "assessment" },
  { label: "Configuración",     href: "/configuracion",     icon: "settings" },
];

export const ROUTES = {
  login:           "/login",
  dashboard:       "/dashboard",
  inventario:      "/inventario",
  movimientos:     "/movimientos",
  clasificacionAbc: "/clasificacion-abc",
  proveedores:     "/proveedores",
  reportes:        "/reportes",
  configuracion:   "/configuracion",
};