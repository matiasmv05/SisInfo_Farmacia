// app/(Pages)/clasificacion-abc/page.tsx
"use client";

import React from "react";
import { AbcProvider, useAbc } from "../../context/AbcContext";
import AbcSummaryCards from "../../components/ClasificacionABC/AbcSummaryCards";
import ParetoChart from "../../components/ClasificacionABC/ParetoChart";
import AbcTable from "../../components/ClasificacionABC/AbcTable";

function AbcPageContent() {
  const { updating, recalculateClassification, loading, error } = useAbc();

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="font-body-md text-body-md text-on-surface-variant animate-pulse">
            Cargando análisis ABC...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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
          <span
            className={`material-symbols-outlined text-[18px] ${
              updating ? "animate-spin" : ""
            }`}
          >
            sync
          </span>
          {updating ? "Calculando..." : "Actualizar Clasificación ABC"}
        </button>
      </div>

      {/* Banner de error — solo se muestra si hay error pero NO está cargando */}
      {error && (
        <div
          className={`flex items-start gap-3 rounded-lg px-4 py-3 border text-sm ${
            error.type === "NO_DATA"
              ? "bg-surface-container border-outline-variant text-on-surface-variant"
              : "bg-error-container/20 border-error/30 text-error"
          }`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
            {error.type === "NO_DATA" ? "info" : "error_outline"}
          </span>
          <div>
            <p className="font-medium">
              {error.type === "NO_DATA"
                ? "Sin datos de clasificación"
                : "Error al cargar"}
            </p>
            <p className="text-xs mt-0.5 opacity-80">{error.message}</p>
          </div>
        </div>
      )}

      {/* Contenido principal — se renderiza si hay datos (no hay error) */}
      {!error && (
        <>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7">
              <AbcSummaryCards />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <ParetoChart />
            </div>
          </div>

          <div className="w-full">
            <AbcTable />
          </div>
        </>
      )}

      {/* Si es NO_DATA, mostrar solo la tabla vacía igualmente */}
      {error?.type === "NO_DATA" && (
        <div className="w-full">
          <AbcTable />
        </div>
      )}
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