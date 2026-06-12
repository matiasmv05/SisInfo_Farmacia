// app/(dashboard)/clasificacion-abc/page.tsx
"use client";

import React from "react";
import { AbcProvider, useAbc } from "../../context/AbcContext";
import AbcSummaryCards from "../../components/AbcSummaryCards";
import ParetoChart from "../../components/ParetoChart";
import AbcTable from "../../components/AbcTable";

function AbcPageContent() {
  const { updating, recalculateClassification, loading } = useAbc();

  if (loading) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="font-body-md text-body-md text-on-surface-variant animate-pulse">
            Analizando inventario farmacéutico...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Análisis ABC (Pareto)
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Distribución de valor de inventario vs catálogo de productos.
          </p>
        </div>

        <button
          onClick={recalculateClassification}
          disabled={updating}
          className="bg-primary text-on-primary font-label-md text-label-md px-6 h-10 rounded shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
        >
          <span className={`material-symbols-outlined text-[18px] ${updating ? "animate-spin" : ""}`}>
            sync
          </span>
          {updating ? "Actualizando..." : "Actualizar Clasificación ABC"}
        </button>
      </div>

      {/* Summary Dashboard (Bento Grid) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <AbcSummaryCards />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ParetoChart />
        </div>
      </div>

      {/* Detailed Items Table */}
      <div className="w-full">
        <AbcTable />
      </div>
    </div>
  );
}

export default function ClasificacionAbcPage() {
  return (
    <AbcProvider>
      <AbcPageContent />
    </AbcProvider>
  );
}
