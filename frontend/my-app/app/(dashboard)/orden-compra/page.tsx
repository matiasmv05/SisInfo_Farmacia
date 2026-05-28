// app/(dashboard)/orden-compra/page.tsx
"use client";

import React from "react";
import { OrdenCompraProvider } from "../../context/OrdenCompraContext";
import OrdenCompraFilters from "../../components/OrdenCompraFilters";
import OrdenCompraTable from "../../components/OrdenCompraTable";

export default function OrdenCompraPage() {
  return (
    <OrdenCompraProvider>
      {/* ── Encabezado de página ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">
            Gestión de Órdenes de Compra
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Administre y monitoree el flujo de abastecimiento.
          </p>
        </div>

        <button className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded shadow-sm hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2 uppercase tracking-wide">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva Orden
        </button>
      </div>

      {/* ── Filtros ── */}
      <OrdenCompraFilters />

      {/* ── Tabla ── */}
      <OrdenCompraTable />
    </OrdenCompraProvider>
  );
}
