// app/components/SideNavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/Authcontext";

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, active }) => {
  if (active) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 py-3 px-4 border-l-4 border-primary bg-primary-container/10 text-primary font-bold transition-colors duration-150 active:opacity-90"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 py-3 px-4 text-on-surface-variant hover:bg-surface-container transition-colors duration-150 active:opacity-90"
    >
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </Link>
  );
};

export const SideNavBar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <aside className="bg-surface-container-lowest dark:bg-surface-container-low text-primary dark:text-primary-fixed font-body-md text-body-md fixed left-0 top-0 h-full w-[260px] border-r border-outline-variant flex flex-col py-container_padding z-50">
      <div className="px-6 mb-8">
        <h1 className="text-headline-sm font-headline-sm text-primary dark:text-primary-fixed leading-tight">
          F. Cristo Redentor
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Gestión Pro
        </p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <NavItem
          href="/dashboard"
          icon="dashboard"
          label="Dashboard"
          active={pathname === "/dashboard"}
        />
        <NavItem
          href="/inventario"
          icon="inventory_2"
          label="Inventario"
          active={pathname === "/inventario"}
        />
        <NavItem
          href="/movimientos"
          icon="swap_horiz"
          label="Movimientos"
          active={pathname === "/movimientos"}
        />
        <NavItem
          href="/clasificacion-abc"
          icon="analytics"
          label="Clasificación ABC"
          active={pathname === "/clasificacion-abc" || pathname === "/"}
        />
        <NavItem
          href="/proveedores/nuevo"
          icon="local_shipping"
          label="Proveedores"
          active={pathname.startsWith("/proveedores")}
        />
        <NavItem
          href="/orden-compra"
          icon="receipt_long"
          label="Órdenes de Compra"
          active={pathname === "/orden-compra"}
        />
        <NavItem
          href="/reportes"
          icon="assessment"
          label="Reportes"
          active={pathname === "/reportes"}
        />
        <NavItem
          href="/configuracion"
          icon="settings"
          label="Configuración"
          active={pathname === "/configuracion"}
        />
      </nav>

      <div className="mt-auto px-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-3 px-4 text-on-surface-variant hover:bg-surface-container transition-colors duration-150 active:opacity-90 rounded-md text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};
export default SideNavBar;
