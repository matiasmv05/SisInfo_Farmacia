// app/components/TopAppBar.tsx
"use client";

import React from "react";
import { useAuth } from "../context/Authcontext";

export const TopAppBar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-surface dark:bg-surface-dim text-primary dark:text-primary-fixed font-headline-sm text-headline-sm fixed top-0 right-0 w-[calc(100%-260px)] z-40 border-b border-outline-variant flex justify-between items-center h-row_height_standard px-gutter">
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:bg-surface-container transition-colors p-2 rounded-full active:scale-95 duration-100 flex items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="text-headline-sm font-headline-sm font-semibold text-on-surface">
          Inventario Farmacéutico
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Nombre de usuario para darle mayor valor estético y contextual */}
        {user && (
          <span className="text-body-sm font-semibold text-on-surface-variant mr-2 hidden sm:inline">
            {user.nombreCompleto || user.username}
          </span>
        )}
        <button className="text-on-surface-variant hover:bg-surface-container transition-colors p-2 rounded-full active:scale-95 duration-100 flex items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container transition-colors p-2 rounded-full active:scale-95 duration-100 flex items-center justify-center cursor-pointer" title={user?.rol || "Usuario"}>
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
};
export default TopAppBar;
