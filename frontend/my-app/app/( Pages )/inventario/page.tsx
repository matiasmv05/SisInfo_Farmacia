"use client";

import React from "react";
import { InventarioProvider } from "../../context/InventarioContext";
import InventarioFilters from "../../components/Inventario/InventarioFilters";
import InventarioTable from "../../components/Inventario/InventarioTable";
import { useAuth } from "../../context/Authcontext";
import Link from "next/link";

function InventarioPageContent() {
  const { user } = useAuth();
  const esAdmin = user?.rol === "ADMINISTRADOR";

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Catálogo de Productos
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Gestione y filtre el inventario general.
          </p>
        </div>

        {/* Solo ADMIN ve el botón */}
        {esAdmin && (
          <Link
            href="/inventario/crear"
            className="bg-primary text-on-primary px-5 py-2.5 rounded shadow-sm font-label-md text-label-md hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo Producto
          </Link>
        )}
      </div>

      <InventarioFilters />
      <InventarioTable />
    </div>
  );
}

export default function InventarioPage() {
  return (
    <InventarioProvider>
      <InventarioPageContent />
    </InventarioProvider>
  );
}