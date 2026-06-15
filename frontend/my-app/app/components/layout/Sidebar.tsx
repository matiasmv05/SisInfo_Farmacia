"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/Authcontext";
import { NAV_ITEMS } from "../../../routes/paths";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Filtra los ítems según el rol del usuario autenticado
  const visibleItems = NAV_ITEMS.filter((item) =>
    user?.rol ? item.roles.includes(user.rol as "ADMINISTRADOR" | "OPERADOR") : false
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest border-r border-outline-variant flex flex-col z-30">
      <div className="flex flex-col h-full py-6">
        {/* Brand */}
        <div className="px-4 mb-8">
          <h1 className="text-headline-sm font-headline-sm text-primary">
            F. Cristo Redentor
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {user?.rol === "ADMINISTRADOR" ? "Administrador" : "Operador"}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 py-3 px-4 border-l-4 transition-colors duration-150 ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-transparent text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-xl ${isActive ? "fill" : ""}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="mt-auto px-4 pt-4 border-t border-outline-variant">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 py-3 px-4 text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 rounded"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}