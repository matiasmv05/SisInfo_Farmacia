// app/components/ClasificacionABC/AbcTable.tsx
"use client";

import React, { useState } from "react";
import { useAbc } from "../../context/AbcContext";

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
    metadata,
  } = useAbc();

  const [exporting, setExporting] = useState(false);

  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startItem =
    totalFilteredItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalFilteredItems);

  // ─── Exportar a CSV ──────────────────────────────────────────────────────
  const handleExport = () => {
    setExporting(true);

    const headers = [
      "Código",
      "Artículo",
      "Laboratorio",
      "Valor Rotación",
      "% Individual",
      "% Acumulado",
      "Clasificación",
    ];

    const rows = items.map((item) => [
      item.codigo,
      `"${item.articulo}"`,
      `"${item.laboratorio}"`,
      item.valor.toFixed(2),
      item.porcentajeIndividual.toFixed(1),
      item.porcentajeAcumulado.toFixed(1),
      item.clasificacion,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clasificacion-abc-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setExporting(false), 800);
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

  // Ciclo de filtro de categoría con click
  const cycleCategory = () => {
    const order = ["ALL", "A", "B", "C", "ALL"] as const;
    const idx = order.indexOf(selectedCategory as (typeof order)[number]);
    setSelectedCategory(order[idx + 1] ?? "ALL");
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      {/* Cabecera */}
      <div className="px-5 py-4 border-b border-outline-variant flex flex-col md:flex-row gap-3 md:items-center justify-between bg-surface">
        <div className="flex flex-col gap-0.5">
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
                <span className="material-symbols-outlined text-[12px] font-bold">
                  close
                </span>
              </span>
            )}
          </div>

          {/* Metadatos del cálculo */}
          {metadata && (
            <p className="text-body-sm text-on-surface-variant text-[11px]">
              Último cálculo:{" "}
              {new Date(metadata.fechaCalculo).toLocaleString("es-BO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              — por {metadata.usuarioNombre}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por código, nombre o laboratorio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-outline-variant rounded bg-surface-container-lowest text-body-sm focus:outline-none focus:border-primary w-[260px]"
            />
            <span className="material-symbols-outlined text-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
              search
            </span>
          </div>

          <button
            onClick={cycleCategory}
            className="text-primary font-label-md text-label-md px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              filter_list
            </span>
            {selectedCategory === "ALL" ? "Filtrar" : `Cat. ${selectedCategory}`}
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || items.length === 0}
            className="text-primary font-label-md text-label-md px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">
              {exporting ? "hourglass_empty" : "download"}
            </span>
            {exporting ? "Exportando..." : "Exportar CSV"}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto">
        {items.length === 0 ? (
          <div className="py-12 px-5 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] opacity-40">
              inventory
            </span>
            <p className="mt-2 font-body-md text-body-md">
              No se encontraron artículos con los criterios actuales.
            </p>
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
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-semibold">
                  LABORATORIO
                </th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-semibold text-right">
                  VALOR ROTACIÓN
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
              {items.map((item) => (
                <tr
                  key={item.productoId}
                  className="border-b border-surface-container-high hover:bg-surface-container/50 transition-colors"
                >
                  <td className="py-[12px] px-5 font-data-mono text-data-mono">
                    {item.codigo}
                  </td>
                  <td className="py-[12px] px-5 font-medium">{item.articulo}</td>
                  <td className="py-[12px] px-5 text-on-surface-variant text-sm">
                    {item.laboratorio}
                  </td>
                  <td className="py-[12px] px-5 text-right font-data-mono text-data-mono">
                    {item.valor.toLocaleString("es-BO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-[12px] px-5 text-right">
                    {item.porcentajeIndividual.toFixed(1)}%
                  </td>
                  <td className="py-[12px] px-5 text-right font-medium text-primary">
                    {item.porcentajeAcumulado.toFixed(1)}%
                  </td>
                  <td className="py-[12px] px-5 text-center">
                    <span className={getTagClass(item.clasificacion)}>
                      {item.clasificacion}
                    </span>
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
          Mostrando {startItem}–{endItem} de{" "}
          {totalFilteredItems.toLocaleString()} artículos
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || totalFilteredItems === 0}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-40 cursor-pointer flex items-center"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
          </button>
          <span className="px-2 py-1 text-xs font-medium">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages || totalFilteredItems === 0}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-40 cursor-pointer flex items-center"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbcTable;