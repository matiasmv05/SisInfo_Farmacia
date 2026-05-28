// app/context/OrdenCompraContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  OrdenCompra,
  OrdenCompraFiltersState,
  PaginationMeta,
} from "../types/OrdenCompra.types";
import {
  getOrdenesCompra,
  deleteOrdenCompra,
} from "../services/OrdenCompra.service";

// ─── Tipos del contexto ───────────────────────────────────────────────────────
interface OrdenCompraContextType {
  // Datos
  ordenes: OrdenCompra[];
  pagination: PaginationMeta;

  // Filtros
  filters: OrdenCompraFiltersState;
  setFilters: (f: Partial<OrdenCompraFiltersState>) => void;
  applyFilters: () => void;
  resetFilters: () => void;

  // Paginación
  goToPage: (page: number) => void;

  // Acciones
  removeOrden: (id: string) => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_FILTERS: OrdenCompraFiltersState = {
  busqueda: "",
  estado: "",
  fechaDesde: "",
};

const PAGE_SIZE = 5;

// ─── Contexto ────────────────────────────────────────────────────────────────
const OrdenCompraContext = createContext<OrdenCompraContextType | null>(null);

export function OrdenCompraProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<OrdenCompraFiltersState>(DEFAULT_FILTERS);
  // Filtros "aplicados" — se actualizan sólo al pulsar "Filtrar"
  const [appliedFilters, setAppliedFilters] = useState<OrdenCompraFiltersState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  // Derivar lista y total desde el servicio mock
  const { data: ordenes, total } = useMemo(
    () => getOrdenesCompra(appliedFilters, currentPage, PAGE_SIZE),
    [appliedFilters, currentPage]
  );

  const pagination: PaginationMeta = {
    currentPage,
    pageSize: PAGE_SIZE,
    total,
  };

  // Actualizar sólo los campos del filtro que se pasen
  const setFilters = useCallback((partial: Partial<OrdenCompraFiltersState>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  // Confirmar filtros y volver a la página 1
  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  }, [filters]);

  // Limpiar todo
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const removeOrden = useCallback((id: string) => {
    deleteOrdenCompra(id);
    // Forzar re-render volviendo a aplicar filtros actuales
    setAppliedFilters((prev) => ({ ...prev }));
  }, []);

  return (
    <OrdenCompraContext.Provider
      value={{
        ordenes,
        pagination,
        filters,
        setFilters,
        applyFilters,
        resetFilters,
        goToPage,
        removeOrden,
      }}
    >
      {children}
    </OrdenCompraContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOrdenCompra(): OrdenCompraContextType {
  const ctx = useContext(OrdenCompraContext);
  if (!ctx) {
    throw new Error("useOrdenCompra debe usarse dentro de <OrdenCompraProvider>");
  }
  return ctx;
}
