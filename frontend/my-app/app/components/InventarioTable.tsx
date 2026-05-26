// app/components/InventarioTable.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useInventario, getStockStatus } from "../context/InventarioContext";
import { InventarioItem } from "../types/Inventario.types";

// ————— Colores semánticos de stock —————
const stockStatusConfig = {
  critical: {
    bar: "bg-status-critical",
    text: "text-status-critical",
  },
  warning: {
    bar: "bg-status-warning",
    text: "text-status-warning",
  },
  good: {
    bar: "bg-status-good",
    text: "text-status-good",
  },
};

// ————— Estilos de badge ABC —————
const abcBadgeConfig = {
  A: "bg-status-a-bg text-status-a-text border border-status-a-text/20",
  B: "bg-status-b-bg text-status-b-text border border-status-b-text/20",
  C: "bg-status-c-bg text-status-c-text border border-status-c-text/20",
};

// ————— Dropdown de acciones por fila —————
const ActionMenu: React.FC<{ item: InventarioItem }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-primary p-1 rounded hover:bg-surface-container transition-colors"
        title="Acciones"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-30 overflow-hidden animate-[fadeInScale_150ms_ease-out]">
          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 text-body-sm hover:bg-surface-container transition-colors text-on-surface"
            onClick={() => { setOpen(false); alert(`Editar: ${item.nombre}`); }}
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
            Editar
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 text-body-sm hover:bg-surface-container transition-colors text-on-surface"
            onClick={() => { setOpen(false); alert(`Ver detalle: ${item.nombre}`); }}
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">visibility</span>
            Ver detalle
          </button>
          <div className="border-t border-outline-variant/60" />
          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 text-body-sm hover:bg-status-critical/5 transition-colors text-status-critical"
            onClick={() => { setOpen(false); alert(`Eliminar: ${item.nombre}`); }}
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

// ————— Tabla principal —————
export const InventarioTable: React.FC = () => {
  const {
    items,
    loading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalFilteredItems,
  } = useInventario();

  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startItem = totalFilteredItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalFilteredItems);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm flex flex-col flex-1">
      {/* Tabla */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="font-body-md text-body-md text-on-surface-variant animate-pulse">
                Cargando catálogo...
              </span>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface border-b border-outline-variant sticky top-0 z-10">
              <tr>
                {/* Columna barra de estado (sin título) */}
                <th className="py-3 px-3 w-2"></th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">CÓDIGO</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">NOMBRE DEL PRODUCTO</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">CATEGORÍA</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">LABORATORIO</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">STOCK</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">MÍNIMO</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">CLASE ABC</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">PRECIO</th>
                <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <span className="material-symbols-outlined text-[48px] text-outline/40 block">
                      inventory_2
                    </span>
                    <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                      No se encontraron productos con los filtros actuales.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const status = getStockStatus(item.stock, item.minimo);
                  const statusCfg = stockStatusConfig[status];
                  const isClassA = item.claseAbc === "A";

                  return (
                    <tr
                      key={item.codigo}
                      className={`hover:bg-[#F0F7FF] transition-colors group relative ${isClassA ? "bg-status-a-bg/20" : ""}`}
                    >
                      {/* Barra de estado a la izquierda */}
                      <td className="p-0 relative w-2">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-[3px] ${statusCfg.bar}`}
                        />
                      </td>
                      <td className="py-[12px] px-4 font-data-mono text-data-mono text-outline">
                        {item.codigo}
                      </td>
                      <td className="py-[12px] px-4 font-medium text-on-surface whitespace-nowrap">
                        {item.nombre}
                      </td>
                      <td className="py-[12px] px-4 text-on-surface-variant">
                        {item.categoria}
                      </td>
                      <td className="py-[12px] px-4 text-on-surface-variant">
                        {item.laboratorio}
                      </td>
                      <td className={`py-[12px] px-4 text-right font-medium ${statusCfg.text}`}>
                        {item.stock.toLocaleString()}
                      </td>
                      <td className="py-[12px] px-4 text-right text-outline">
                        {item.minimo}
                      </td>
                      <td className="py-[12px] px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded font-label-md text-label-md ${
                            abcBadgeConfig[item.claseAbc]
                          }`}
                        >
                          {item.claseAbc}
                        </span>
                      </td>
                      <td className="py-[12px] px-4 text-right font-data-mono text-data-mono">
                        ${item.precio.toFixed(2)}
                      </td>
                      <td className="py-[12px] px-4 text-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                          <ActionMenu item={item} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      <div className="bg-surface border-t border-outline-variant px-5 py-3 flex items-center justify-between">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {totalFilteredItems === 0
            ? "Sin resultados"
            : `Mostrando ${startItem}-${endItem} de ${totalFilteredItems.toLocaleString()} productos`}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || totalFilteredItems === 0}
            className="px-3 py-1.5 border border-outline-variant rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalFilteredItems === 0}
            className="px-3 py-1.5 border border-outline-variant rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventarioTable;
