// app/context/AbcContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  AbcItem,
  AbcCategorySummary,
  AbcClassification,
  AbcMetadata,
} from "../types/Abc.types";
import { fetchUltimoAbcApi, recalcularAbcApi } from "../api/Abc.api";
import { transformAbcHistorial } from "../service/Abc.service";

// ─── Tipos de error para distinguir casos ────────────────────────────────────
type AbcError =
  | { type: "NO_DATA"; message: string }   // backend 404: aún no hay cálculos
  | { type: "SERVER"; message: string }    // error de red o 5xx
  | null;

interface AbcContextType {
  // Datos
  items: AbcItem[];              // página actual (paginados)
  filteredItems: AbcItem[];      // todos los filtrados (sin paginar)
  allItems: AbcItem[];           // todos los items sin filtrar
  summaries: AbcCategorySummary[];
  metadata: AbcMetadata | null;

  // Estados
  loading: boolean;
  updating: boolean;
  error: AbcError;

  // Filtros
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: AbcClassification | "ALL";
  setSelectedCategory: (c: AbcClassification | "ALL") => void;

  // Paginación
  currentPage: number;
  setCurrentPage: (p: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  totalFilteredItems: number;

  // Acciones
  recalculateClassification: () => Promise<void>;
  reloadData: () => Promise<void>;
}

const AbcContext = createContext<AbcContextType | undefined>(undefined);

export const AbcProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ─── Estado central ────────────────────────────────────────────────────────
  const [allItems, setAllItems] = useState<AbcItem[]>([]);
  const [summaries, setSummaries] = useState<AbcCategorySummary[]>([]);
  const [metadata, setMetadata] = useState<AbcMetadata | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<AbcError>(null);

  // ─── Filtros y paginación ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    AbcClassification | "ALL"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ─── Carga de datos desde el backend ──────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const historial = await fetchUltimoAbcApi();
      const { items, summaries, metadata } = transformAbcHistorial(historial);

      setAllItems(items);
      setSummaries(summaries);
      setMetadata(metadata);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";

      // El backend devuelve 404 con "No hay cálculos ABC completados"
      // cuando nunca se ha ejecutado el análisis
      if (msg.includes("404") || msg.toLowerCase().includes("no hay")) {
        setError({
          type: "NO_DATA",
          message:
            "Aún no se ha ejecutado el análisis ABC. Presiona «Actualizar Clasificación» para generarlo.",
        });
      } else {
        setError({ type: "SERVER", message: msg });
      }

      setAllItems([]);
      setSummaries([]);
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Filtrar ───────────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.codigo.toLowerCase().includes(q) ||
        item.articulo.toLowerCase().includes(q) ||
        item.laboratorio.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "ALL" || item.clasificacion === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allItems, searchQuery, selectedCategory]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // ─── Paginar ───────────────────────────────────────────────────────────────
  const items = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalFilteredItems = filteredItems.length;

  // ─── Recálculo manual → POST /api/clasificacion-abc/calcular ──────────────
  const recalculateClassification = async () => {
    try {
      setUpdating(true);
      setError(null);

      const historial = await recalcularAbcApi("Recálculo manual desde UI");
      const { items, summaries, metadata } = transformAbcHistorial(historial);

      setAllItems(items);
      setSummaries(summaries);
      setMetadata(metadata);
      setCurrentPage(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al recalcular";
      setError({ type: "SERVER", message: msg });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AbcContext.Provider
      value={{
        items,
        filteredItems,
        allItems,
        summaries,
        metadata,
        loading,
        updating,
        error,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalFilteredItems,
        recalculateClassification,
        reloadData: loadData,
      }}
    >
      {children}
    </AbcContext.Provider>
  );
};

export const useAbc = () => {
  const context = useContext(AbcContext);
  if (!context) {
    throw new Error("useAbc debe usarse dentro de un AbcProvider");
  }
  return context;
};