// app/context/InventarioContext.tsx  ← reemplaza tu archivo existente
"use client";

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from "react";
import { ProductoDetalle, StockStatus, CategoriaProducto } from "../types/Inventario.types";
import {
  fetchProductosApi,
  createProductoApi,
  deleteProductoApi,
  updateProductoApi,   // ← nuevo
  activarProductoApi,  // ← nuevo
} from "../api/Producto.api";

export function getStockStatus(stock: number, minimo: number): StockStatus {
  if (stock < minimo)         return "critical";
  if (stock < minimo * 1.2)   return "warning";
  return "good";
}

interface InventarioContextType {
  items: ProductoDetalle[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategoria: CategoriaProducto | '';
  setSelectedCategoria: (c: CategoriaProducto | '') => void;
  selectedClasificacionAbc: string;
  setSelectedClasificacionAbc: (c: string) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  itemsPerPage: number;
  totalItems: number;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  createProduct:   (payload: Omit<ProductoDetalle, 'id' | 'activo' | 'stockTotal' | 'clasificacionAbc'>) => Promise<void>;
  updateProduct:   (id: number, payload: Partial<ProductoDetalle>) => Promise<void>;  // ← nuevo
  deleteProduct:   (id: number) => Promise<void>;
  activateProduct: (id: number) => Promise<void>;  // ← nuevo
  refresh: () => void;
}

const InventarioContext = createContext<InventarioContextType | undefined>(undefined);

export const InventarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems]             = useState<ProductoDetalle[]>([]);
  const [loading, setLoading]         = useState(true);
  const [creating, setCreating]       = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalItems, setTotalItems]   = useState(0);

  const [searchQuery, setSearchQueryRaw]             = useState('');
  const [selectedCategoria, setSelectedCategoriaRaw] = useState<CategoriaProducto | ''>('');
  const [selectedClasificacionAbc, setSelectedClasificacionAbcRaw] = useState<string>('');
  const [currentPage, setCurrentPageRaw]             = useState(1);
  const itemsPerPage = 20;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryRaw(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(q), 400);
  }, []);

  const setSelectedCategoria = useCallback((c: CategoriaProducto | '') => {
    setSelectedCategoriaRaw(c);
    setCurrentPageRaw(1);
  }, []);

  const setSelectedClasificacionAbc = useCallback((c: string) => {
    setSelectedClasificacionAbcRaw(c);
    setCurrentPageRaw(1);
  }, []);

  const setCurrentPage = useCallback((p: number) => setCurrentPageRaw(p), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProductosApi({
        page: currentPage - 1,
        limit: itemsPerPage,
        nombre: debouncedSearch || undefined,
        categoria: selectedCategoria || undefined,
        clasificacionAbc: selectedClasificacionAbc || undefined,
      });
      setItems(res.data);
      setTotalItems(res.totalElements); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, selectedCategoria, selectedClasificacionAbc]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setCurrentPageRaw(1); }, [debouncedSearch, selectedCategoria, selectedClasificacionAbc]);

  const openModal  = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const createProduct = useCallback(async (
    payload: Omit<ProductoDetalle, 'id' | 'activo' | 'stockTotal' | 'clasificacionAbc'>
  ) => {
    setCreating(true);
    setError(null);
    try {
      await createProductoApi({
        ...payload,
        activo: true,
        stockMaximo: payload.stockMaximo ?? undefined,
        diasMinimosVenta: payload.diasMinimosVenta ?? undefined,
      });
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear producto');
      throw err;
    } finally {
      setCreating(false);
    }
  }, [loadData]);

// ── Nuevo: actualizar producto ──
const updateProduct = useCallback(async (id: number, payload: Partial<ProductoDetalle>) => {
  setError(null);
  try {
    // Buscar el producto actual para completar los campos requeridos
    const current = items.find(item => item.id === id);
    if (!current) throw new Error(`Producto ${id} no encontrado`);

    // Combinar datos actuales con el payload parcial → ProductoRequest completo
    const merged = { ...current, ...payload };
    await updateProductoApi(id, {
      nombre:           merged.nombre,
      categoria:        merged.categoria,
      laboratorio:      merged.laboratorio,
      concentracion:    merged.concentracion,
      presentacion:     merged.presentacion,
      precioCosto:      merged.precioCosto,
      precioVenta:      merged.precioVenta,
      stockMinimo:      merged.stockMinimo,
      stockMaximo:      merged.stockMaximo ?? undefined,
      diasMinimosVenta: merged.diasMinimosVenta ?? undefined,
      activo:           merged.activo,
    });

    // Actualización optimista en memoria
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, ...payload } : item)
    );
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error al actualizar producto');
    throw err;
  }
}, [items]);

  const deleteProduct = useCallback(async (id: number) => {
    setError(null);
    try {
      await deleteProductoApi(id);
      // Actualización optimista: marca como inactivo sin recargar
      setItems(prev =>
        prev.map(item => item.id === id ? { ...item, activo: false } : item)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desactivar producto');
      throw err;
    }
  }, []);

  // ── Nuevo: activar producto ──
  const activateProduct = useCallback(async (id: number) => {
    setError(null);
    try {
      await activarProductoApi(id);
      // Actualización optimista
      setItems(prev =>
        prev.map(item => item.id === id ? { ...item, activo: true } : item)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar producto');
      throw err;
    }
  }, []);

  return (
    <InventarioContext.Provider value={{
      items, loading, creating, error,
      searchQuery, setSearchQuery,
      selectedCategoria, setSelectedCategoria,
      selectedClasificacionAbc, setSelectedClasificacionAbc,
      currentPage, setCurrentPage,
      itemsPerPage, totalItems,
      isModalOpen, openModal, closeModal,
      createProduct,
      updateProduct,   // ← expuesto
      deleteProduct,
      activateProduct, // ← expuesto
      refresh: loadData,
    }}>
      {children}
    </InventarioContext.Provider>
  );
};

export function useInventario() {
  const ctx = useContext(InventarioContext);
  if (!ctx) throw new Error("useInventario debe usarse dentro de InventarioProvider");
  return ctx;
}