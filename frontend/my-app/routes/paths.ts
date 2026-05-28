import { NavItem } from "../app/types/Nav.types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",         href: "/dashboard",         icon: "dashboard" },
  { label: "Inventario",        href: "/inventario",        icon: "inventory_2" },
  { label: "Órdenes",           href: "/ordenes",           icon: "receipt_long" },
  { label: "Recepción",         href: "/recepcion",         icon: "swap_horiz" },
  { label: "Movimientos",       href: "/movimiento",        icon: "output" },
  { label: "Clasificación ABC", href: "/clasificacion-abc", icon: "analytics" },
  { label: "Proveedores",       href: "/proveedores",       icon: "local_shipping" },
  { label: "Reportes",          href: "/reportes",          icon: "assessment" },
  { label: "Usuarios",          href: "/usuarios",          icon: "group" },
  { label: "Configuración",     href: "/configuracion",     icon: "settings" },
];

export const ROUTES = {
  login:            "/login",
  dashboard:        "/dashboard",
  inventario:       "/inventario",
  crearProducto:    "/inventario/crear",
  ordenes:          "/ordenes",
  recepcion:        "/recepcion",
  movimiento:       "/movimiento",
  clasificacionAbc: "/clasificacion-abc",
  proveedores:      "/proveedores",
  crearProveedores: "/proveedores/crear",
  reportes:         "/reportes",
  usuarios:         "/usuarios",
  configuracion:    "/configuracion",
  crearProveedor:   "/proveedor/crear"
};