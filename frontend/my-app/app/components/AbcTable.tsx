// app/components/AbcTable.tsx
"use client";

import React, { useState } from "react";
import { useAbc } from "../context/AbcContext";

export const AbcTable: React.FC = () => {
  const {
    items,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalFilteredItems,
  } = useAbc();

  const [exporting, setExporting] = useState(false);

  // Calcular límites de paginación
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startItem = totalFilteredItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalFilteredItems);

  // Manejar exportación simulada
  const handleExport = () => {
    setExporting(true);
    alert("Exportando clasificación de inventario ABC en formato CSV...");
    setTimeout(() => {
      setExporting(false);
    }, 1500);
  };

  const getTagClass = (clasificacion: string) => {
    switch (clasificacion) {
      case "A":
        return "inline-block px-3 py-1 bg-primary-container/20 text-primary font-label-md text-label-md rounded border border-primary/20 font-bold";
      case "B":
        return "inline-block px-3 py-1 bg-surface-container-high text-on-surface font-label-md text-label-md rounded border border-outline-variant font-bold";
      default:
        return "inline-block px-3 py-1 bg-surface-container text-outline font-label-md text-label-md rounded border border-outline-variant/50 font-bold";
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      {/* Cabecera de la Tabla */}
      <div className="px-5 py-4 border-b border-outline-variant flex flex-col md:flex-row gap-3 md:items-center justify-between bg-surface">
        <div className="flex items-center gap-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Detalle de Artículos
          </h3>
          {selectedCategory !== "ALL" && (
            <span
              onClick={() => setSelectedCategory("ALL")}
              className="bg-primary/10 text-primary border border-primary/20 rounded px-2.5 py-0.5 text-label-sm font-semibold flex items-center gap-1 cursor-pointer hover:bg-primary/20"
            >
              Filtro: Cat. {selectedCategory}
              <span className="material-symbols-outlined text-[12px] font-bold">close</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Campo de búsqueda reactivo */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-outline-variant rounded bg-surface-container-lowest text-body-sm focus:outline-none focus:border-primary w-[220px]"
            />
            <span className="material-symbols-outlined text-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
              search
            </span>
          </div>

          <button
            onClick={() => setSelectedCategory(selectedCategory === "ALL" ? "A" : selectedCategory === "A" ? "B" : selectedCategory === "B" ? "C" : "ALL")}
            className="text-primary font-label-md text-label-md px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Filtrar
          </button>
          
          <button
            onClick={handleExport}
            disabled={exporting}
            className="text-primary font-label-md text-label-md px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">
              {exporting ? "hourglass_empty" : "download"}
            </span>
            {exporting ? "Exportando..." : "Exportar"}
          </button>
        </div>
      </div>

      {/* La Tabla de Artículos */}
      <div className="w-full overflow-x-auto">
        {items.length === 0 ? (
          <div className="py-12 px-5 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] opacity-40">inventory</span>
            <p className="mt-2 font-body-md text-body-md">No se encontraron artículos con los criterios actuales.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-outline-variant">
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-semibold">
                  CÓDIGO
                </th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-semibold">
                  ARTÍCULO
                </th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-semibold text-right">
                  VALOR (STOCK × COSTO)
                </th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-semibold text-right">
                  % INDIVIDUAL
                </th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-semibold text-right">
                  % ACUMULADO
                </th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-semibold text-center">
                  CLASIFICACIÓN
                </th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              {items.map((item, index) => (
                <tr
                  key={item.codigo}
                  className={`border-b border-surface-container-high table-row-hover transition-colors`}
                >
                  <td className="py-[12px] px-5 font-data-mono text-data-mono">
                    {item.codigo}
                  </td>
                  <td className="py-[12px] px-5 font-medium">{item.articulo}</td>
                  <td className="py-[12px] px-5 text-right font-data-mono text-data-mono">
                    ${item.valor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-[12px] px-5 text-right">
                    {item.porcentajeIndividual}%
                  </td>
                  <td className="py-[12px] px-5 text-right font-medium text-primary">
                    {item.porcentajeAcumulado}%
                  </td>
                  <td className="py-[12px] px-5 text-center">
                    <span className={getTagClass(item.clasificacion)}>{item.clasificacion}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      <div className="px-5 py-3 border-t border-outline-variant bg-surface flex justify-between items-center text-body-sm text-on-surface-variant">
        <span>
          Mostrando {startItem}-{endItem} de {totalFilteredItems.toLocaleString()} artículos
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || totalFilteredItems === 0}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalFilteredItems === 0}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default AbcTable;
