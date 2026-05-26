// app/context/InventarioContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { InventarioItem, ClaseAbc } from "../types/Inventario.types";
import {
  fetchInventarioItemsApi,
  createInventarioItemApi,
} from "../api/Inventario.api";

// ————— Utilidad de nivel de stock —————
export function getStockStatus(
  stock: number,
  minimo: number
): "critical" | "warning" | "good" {
  if (stock < minimo) return "critical";
  if (stock < minimo * 1.2) return "warning";
  return "good";
}

// ————— Tipado del contexto —————
interface InventarioContextType {
  items: InventarioItem[];           // Página actual (paginados)
  filteredItems: InventarioItem[];   // Todos los filtrados (sin paginar)
  allItems: InventarioItem[];        // Catálogo completo sin filtros
  loading: boolean;
  creating: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategoria: string;
  setSelectedCategoria: (c: string) => void;
  selectedClaseAbc: ClaseAbc | "ALL";
  setSelectedClaseAbc: (c: ClaseAbc | "ALL") => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  itemsPerPage: number;
  totalFilteredItems: number;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  createProduct: (
    item: Omit<InventarioItem, "codigo">
  ) => Promise<void>;
}

const InventarioContext = createContext<InventarioContextType | undefined>(
  undefined
);

// ————— Provider —————
export const InventarioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [allItems, setAllItems] = useState<InventarioItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedClaseAbc, setSelectedClaseAbc] = useState<ClaseAbc | "ALL">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Carga inicial
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchInventarioItemsApi();
        setAllItems(data);
      } catch (err) {
        console.error("Error cargando catálogo:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoria, selectedClaseAbc]);

  // Aplicar filtros
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.laboratorio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategoria =
        !selectedCategoria || item.categoria === selectedCategoria;

      const matchesClase =
        selectedClaseAbc === "ALL" || item.claseAbc === selectedClaseAbc;

      return matchesSearch && matchesCategoria && matchesClase;
    });
  }, [allItems, searchQuery, selectedCategoria, selectedClaseAbc]);

  // Paginar
  const items = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalFilteredItems = filteredItems.length;

  // Acciones de modal
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Crear producto
  const createProduct = useCallback(
    async (item: Omit<InventarioItem, "codigo">) => {
      try {
        setCreating(true);
        const newItem = await createInventarioItemApi(item);
        setAllItems((prev) => [newItem, ...prev]);
        setIsModalOpen(false);
      } catch (err) {
        console.error("Error creando producto:", err);
      } finally {
        setCreating(false);
      }
    },
    []
  );

  return (
    <InventarioContext.Provider
      value={{
        items,
        filteredItems,
        allItems,
        loading,
        creating,
        searchQuery,
        setSearchQuery,
        selectedCategoria,
        setSelectedCategoria,
        selectedClaseAbc,
        setSelectedClaseAbc,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        totalFilteredItems,
        isModalOpen,
        openModal,
        closeModal,
        createProduct,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
};

export function useInventario() {
  const ctx = useContext(InventarioContext);
  if (!ctx)
    throw new Error("useInventario debe usarse dentro de un InventarioProvider");
  return ctx;
}
