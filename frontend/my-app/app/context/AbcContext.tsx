// app/context/AbcContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { AbcItem, AbcCategorySummary, AbcClassification } from "../types/Abc.types";
import { fetchAbcItemsApi, recalculateAbcItemsApi } from "../api/Abc.api";
import { calculateAbcClassification } from "../services/Abc.service";

interface AbcContextType {
  items: AbcItem[];               // Artículos filtrados y paginados
  filteredItems: AbcItem[];       // Artículos filtrados (antes de paginar)
  allItems: AbcItem[];            // Todos los artículos calculados
  summaries: AbcCategorySummary[]; // Resúmenes por categoría (Bento cards)
  loading: boolean;
  updating: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: AbcClassification | "ALL";
  setSelectedCategory: (category: AbcClassification | "ALL") => void;
  recalculateClassification: () => Promise<void>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (num: number) => void;
  totalFilteredItems: number;
}

const AbcContext = createContext<AbcContextType | undefined>(undefined);

export const AbcProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  
  // Filtros y paginación
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AbcClassification | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default 5 items as in mock

  // Carga inicial
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchAbcItemsApi();
        setRawProducts(data);
      } catch (err) {
        console.error("Error cargando artículos ABC:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calcular clasificación ABC pura cada vez que cambien los productos crudos
  const { items: allItems, summaries } = useMemo(() => {
    return calculateAbcClassification(rawProducts);
  }, [rawProducts]);

  // Aplicar filtros (búsqueda por código/nombre y clasificación)
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.articulo.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "ALL" || item.clasificacion === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allItems, searchQuery, selectedCategory]);

  // Resetear página actual si cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Paginar artículos filtrados
  const items = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalFilteredItems = filteredItems.length;

  // Disparar recálculo simulando cambios de inventario
  const recalculateClassification = async () => {
    try {
      setUpdating(true);
      
      // Simular pequeños cambios en stock y costo aleatorios
      const adjustments: { [codigo: string]: { stock: number; costo: number } } = {};
      rawProducts.forEach((prod) => {
        // Modificar el 30% de los productos al azar para demostrar dinamismo
        if (Math.random() > 0.7) {
          const stockDelta = Math.floor(Math.random() * 50) - 20; // -20 a +30
          const costoDelta = (Math.random() * 4) - 2;            // -2.00 a +2.00
          adjustments[prod.codigo] = {
            stock: Math.max(10, prod.stock + stockDelta),
            costo: Math.max(0.5, Number((prod.costo + costoDelta).toFixed(2))),
          };
        }
      });

      const updatedRaw = await recalculateAbcItemsApi(adjustments);
      setRawProducts(updatedRaw);
    } catch (err) {
      console.error("Error al recalcular Pareto:", err);
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
        loading,
        updating,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        recalculateClassification,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalFilteredItems,
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
