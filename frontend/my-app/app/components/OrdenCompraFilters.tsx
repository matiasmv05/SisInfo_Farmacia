// app/components/OrdenCompraFilters.tsx
"use client";

import React from "react";
import { useOrdenCompra } from "../context/OrdenCompraContext";
import { EstadoOrden } from "../types/OrdenCompra.types";

export const OrdenCompraFilters: React.FC = () => {
  const { filters, setFilters, applyFilters, resetFilters } = useOrdenCompra();

  const hasActiveFilters =
    filters.busqueda.trim() !== "" ||
    filters.estado !== "" ||
    filters.fechaDesde !== "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyFilters();
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
      {/* ── Buscador ── */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
          Buscar Proveedor o ID
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Ej. Medtronic, OC-1042..."
            value={filters.busqueda}
            onChange={(e) => setFilters({ busqueda: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {filters.busqueda && (
            <button
              onClick={() => setFilters({ busqueda: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              title="Limpiar búsqueda"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Estado ── */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
          Estado
        </label>
        <div className="relative">
          <select
            value={filters.estado}
            onChange={(e) =>
              setFilters({ estado: e.target.value as EstadoOrden | "" })
            }
            className="w-full pl-4 pr-10 py-2 bg-surface border border-outline-variant rounded font-body-md text-body-md appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="issued">Emitida</option>
            <option value="received">Recibida</option>
            <option value="canceled">Cancelada</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
            expand_more
          </span>
        </div>
      </div>

      {/* ── Fecha desde ── */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
          Desde Fecha
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
            calendar_today
          </span>
          <input
            type="date"
            value={filters.fechaDesde}
            onChange={(e) => setFilters({ fechaDesde: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="flex gap-2 items-end">
        <button
          onClick={applyFilters}
          className="bg-surface text-primary border border-primary font-label-md text-label-md px-6 py-2.5 rounded hover:bg-primary/5 transition-colors uppercase h-[42px]"
        >
          Filtrar
        </button>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            title="Limpiar filtros"
            className="flex items-center gap-1 px-3 py-2.5 text-on-surface-variant border border-outline-variant rounded hover:bg-surface-container transition-colors h-[42px]"
          >
            <span className="material-symbols-outlined text-[18px]">
              filter_alt_off
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default OrdenCompraFilters;
