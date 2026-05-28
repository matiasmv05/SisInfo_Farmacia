// app/components/OrdenCompraTable.tsx
"use client";

import React from "react";
import { useOrdenCompra } from "../context/OrdenCompraContext";
import OrdenCompraStatusBadge from "./OrdenCompraStatusBadge";
import { formatDate, formatCurrency } from "../services/OrdenCompra.service";

export const OrdenCompraTable: React.FC = () => {
  const { ordenes, pagination, goToPage, removeOrden } = useOrdenCompra();

  const { currentPage, pageSize, total } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  const startRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, total);

  const handleDelete = (id: string) => {
    if (confirm(`¿Eliminar la orden ${id}?`)) {
      removeOrden(id);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.02)]">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          {/* ── Cabecera ── */}
          <thead>
            <tr className="bg-surface-bright border-b border-outline-variant">
              {["ID Orden", "Fecha", "Proveedor", "Total (USD)", "Estado", "Acciones"].map(
                (col, i) => (
                  <th
                    key={col}
                    className={`font-label-md text-label-md text-on-surface-variant py-3 px-4 uppercase font-semibold ${
                      col === "Total (USD)" ? "text-right" : ""
                    } ${col === "Acciones" ? "text-center" : ""}`}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>

          {/* ── Cuerpo ── */}
          <tbody className="font-data-mono text-data-mono text-on-surface">
            {ordenes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-on-surface-variant font-body-md text-body-md">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[48px] text-outline">
                      search_off
                    </span>
                    No se encontraron órdenes de compra.
                  </div>
                </td>
              </tr>
            ) : (
              ordenes.map((orden) => (
                <tr
                  key={orden.id}
                  className="border-b border-surface-variant hover:bg-[#F0F7FF] transition-colors"
                >
                  <td className="py-3 px-4">{orden.id}</td>
                  <td className="py-3 px-4">{formatDate(orden.fecha)}</td>
                  <td className="py-3 px-4 font-body-sm text-body-sm font-medium text-on-surface">
                    {orden.proveedor}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(orden.total)}
                  </td>
                  <td className="py-3 px-4">
                    <OrdenCompraStatusBadge estado={orden.estado} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    {/* Ver detalles — siempre disponible */}
                    <button
                      className="text-on-surface-variant hover:text-primary transition-colors p-1"
                      title="Ver Detalles"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>

                    {/* Editar — sólo en borrador o emitida */}
                    {(orden.estado === "draft" || orden.estado === "issued") && (
                      <button
                        className="text-on-surface-variant hover:text-primary transition-colors p-1 ml-1"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                    )}

                    {/* Eliminar — sólo en borrador */}
                    {orden.estado === "draft" && (
                      <button
                        onClick={() => handleDelete(orden.id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1 ml-1"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ── */}
      <div className="bg-surface px-4 py-3 border-t border-outline-variant flex items-center justify-between">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {total === 0
            ? "Sin resultados"
            : `Mostrando ${startRecord} a ${endRecord} de ${total} registros`}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1 border border-outline-variant rounded bg-surface hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 border border-outline-variant rounded bg-surface hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdenCompraTable;
