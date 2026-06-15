import { NavItem } from "../app/types/Nav.types";


export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",         href: "/dashboard",         icon: "dashboard",      roles: ["ADMINISTRADOR"] },
  { label: "Inventario",        href: "/inventario",        icon: "inventory_2",    roles: ["ADMINISTRADOR", "OPERADOR"] },
  { label: "Órdenes",           href: "/ordenes",           icon: "receipt_long",   roles: ["ADMINISTRADOR", "OPERADOR"] },
  { label: "Recepción",         href: "/recepcion",         icon: "swap_horiz",     roles: ["ADMINISTRADOR", "OPERADOR"] },
  { label: "Movimientos",       href: "/movimiento",        icon: "output",         roles: ["ADMINISTRADOR", "OPERADOR"] },
  { label: "Clasificación ABC", href: "/clasificacion-abc", icon: "analytics",      roles: ["ADMINISTRADOR"] },
  { label: "Proveedores",       href: "/proveedores",       icon: "local_shipping", roles: ["ADMINISTRADOR"] },
  { label: "Reportes",          href: "/reportes",          icon: "assessment",     roles: ["ADMINISTRADOR"] },
  { label: "Usuarios",          href: "/usuarios",          icon: "group",          roles: ["ADMINISTRADOR"] },
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
  crearProveedor:   "/proveedor/crear"
};