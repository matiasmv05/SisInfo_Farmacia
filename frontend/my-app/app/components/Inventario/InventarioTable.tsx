// app/components/Inventario/InventarioTable.tsx  ← reemplaza tu archivo existente
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useInventario, getStockStatus } from "../../context/InventarioContext";
import { ProductoDetalle, ClaseAbc } from "../../types/Inventario.types";
import ProductoDetalleModal from "./Productodetallemodal";
import ProductoEditModal    from "./Productoeditmodal";
import { useAuth } from "../../context/Authcontext";


// ────────────────────────────────────────────────────────────────────────────
const stockStatusConfig = {
  critical: { bar: "bg-status-critical", text: "text-status-critical" },
  warning:  { bar: "bg-status-warning",  text: "text-status-warning"  },
  good:     { bar: "bg-status-good",     text: "text-status-good"     },
};

const abcBadgeConfig: Record<ClaseAbc, string> = {
  A: "bg-status-a-bg text-status-a-text border border-status-a-text/20",
  B: "bg-status-b-bg text-status-b-text border border-status-b-text/20",
  C: "bg-status-c-bg text-status-c-text border border-status-c-text/20",
};

// ── Toggle activo/inactivo ────────────────────────────────────────────────────
// Sin modal: acción directa con feedback visual inmediato (optimistic update en el context)
const ActiveToggle: React.FC<{ item: ProductoDetalle }> = ({ item }) => {
  const { deleteProduct, activateProduct } = useInventario();
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      if (item.activo) {
        await deleteProduct(item.id);   // DELETE /{id} → desactiva
      } else {
        await activateProduct(item.id); // PATCH /{id}  → reactiva
      }
    } catch {
      // El error ya lo maneja el context; nada más que hacer aquí
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={toggling}
      title={item.activo ? 'Desactivar producto' : 'Activar producto'}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full border-2
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30
        disabled:opacity-60 disabled:cursor-not-allowed
        ${item.activo
          ? 'bg-primary border-primary'
          : 'bg-surface-variant border-outline-variant'
        }
      `}
    >
      <span
        className={`
          inline-block h-3.5 w-3.5 rounded-full bg-white shadow
          transition-transform duration-200
          ${item.activo ? 'translate-x-[14px]' : 'translate-x-[1px]'}
          ${toggling ? 'opacity-60' : ''}
        `}
      />
    </button>
  );
};

// ── Dropdown de acciones por fila ────────────────────────────────────────────
const ActionMenu: React.FC<{
  item: ProductoDetalle;
  onEdit:   (item: ProductoDetalle) => void;
  onDetail: (item: ProductoDetalle) => void;
}> = ({ item, onEdit, onDetail }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-primary p-1 rounded hover:bg-surface-container transition-colors"
        title="Acciones"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-30 overflow-hidden">
          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 text-body-sm hover:bg-surface-container transition-colors text-on-surface"
            onClick={() => { setOpen(false); onEdit(item); }}
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
            Editar
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 text-body-sm hover:bg-surface-container transition-colors text-on-surface"
            onClick={() => { setOpen(false); onDetail(item); }}
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">visibility</span>
            Ver detalle
          </button>
        </div>
      )}
    </div>
  );
};

// ── Tabla principal ──────────────────────────────────────────────────────────
export const InventarioTable: React.FC = () => {
  const { user } = useAuth();         
  const esAdmin = user?.rol === "ADMINISTRADOR"; 
  const {
    items, loading, error,
    currentPage, setCurrentPage,
    itemsPerPage, totalItems,
    updateProduct,
  } = useInventario();

  // Estado local para controlar cuál modal está abierto y sobre qué producto
  const [detailProduct, setDetailProduct] = useState<ProductoDetalle | null>(null);
  const [editProduct,   setEditProduct]   = useState<ProductoDetalle | null>(null);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem  = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem    = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
      {/* ── Modals ── */}
      {detailProduct && (
        <ProductoDetalleModal
          producto={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}
      {editProduct && (
        <ProductoEditModal
          producto={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={async (id, payload) => {
            await updateProduct(id, payload);
            // Sincroniza el producto abierto si el usuario lo reabre luego
            setEditProduct(null);
          }}
        />
      )}

      {/* ── Tabla ── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm flex flex-col flex-1">
        <div className="overflow-x-auto flex-1">

          {error && !loading && (
            <div className="flex h-32 items-center justify-center gap-2 text-status-critical">
              <span className="material-symbols-outlined">error</span>
              <span className="text-body-md">{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="font-body-md text-body-md text-on-surface-variant animate-pulse">
                  Cargando catálogo...
                </span>
              </div>
            </div>
          )}

          {!loading && !error && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface border-b border-outline-variant sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3 w-2" />
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">ID</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">NOMBRE DEL PRODUCTO</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">CATEGORÍA</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">LABORATORIO</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">STOCK</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">MÍNIMO</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">CLASE ABC</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">PRECIO VENTA</th>
                  {/* Columna Activo reemplaza a la antigua acción de Desactivar */}
{esAdmin && (
  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">ACTIVO</th>
)}
{esAdmin && (
  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">ACCIONES</th>
)}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {items.length === 0 ? (
                  <tr>
<td colSpan={esAdmin ? 11 : 9} className="py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-outline/40 block">
                        inventory_2
                      </span>
                      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                        No se encontraron productos con los filtros actuales.
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map(item => {
                    const status    = getStockStatus(item.stockTotal, item.stockMinimo);
                    const statusCfg = stockStatusConfig[status];
                    const abc       = item.clasificacionAbc;

                    return (
                      <tr
                        key={item.id}
                        className={`
                          hover:bg-[#F0F7FF] transition-colors group relative
                          ${abc === 'A' ? 'bg-status-a-bg/20' : ''}
                          ${!item.activo ? 'opacity-50' : ''}
                        `}
                      >
                        <td className="p-0 relative w-2">
                          <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${statusCfg.bar}`} />
                        </td>
                        <td className="py-[12px] px-4 font-data-mono text-data-mono text-outline">
                          {item.id}
                        </td>
                        <td className="py-[12px] px-4 font-medium text-on-surface whitespace-nowrap">
                          {item.nombre}
                          {item.concentracion && (
                            <span className="ml-1 text-on-surface-variant font-normal">
                              {item.concentracion}
                            </span>
                          )}
                        </td>
                        <td className="py-[12px] px-4 text-on-surface-variant">{item.categoria}</td>
                        <td className="py-[12px] px-4 text-on-surface-variant">{item.laboratorio}</td>
                        <td className={`py-[12px] px-4 text-right font-medium ${statusCfg.text}`}>
                          {item.stockTotal.toLocaleString()}
                        </td>
                        <td className="py-[12px] px-4 text-right text-outline">{item.stockMinimo}</td>
                        <td className="py-[12px] px-4 text-center">
                          {abc ? (
                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded font-label-md text-label-md ${abcBadgeConfig[abc]}`}>
                              {abc}
                            </span>
                          ) : (
                            <span className="text-outline/40 text-label-md">—</span>
                          )}
                        </td>
                        <td className="py-[12px] px-4 text-right font-data-mono text-data-mono">
                          Bs {item.precioVenta.toFixed(2)}
                        </td>
                        {/* Toggle activo — siempre visible */}
                        {esAdmin && (
  <td className="py-[12px] px-4 text-center">
    <ActiveToggle item={item} />
  </td>
)}
                        {/* Menú de acciones — visible en hover */}
                        {esAdmin && (
  <td className="py-[12px] px-4 text-center">
    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
      <ActionMenu
        item={item}
        onEdit={setEditProduct}
        onDetail={setDetailProduct}
      />
    </div>
  </td>
)}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Paginación ── */}
        <div className="bg-surface border-t border-outline-variant px-5 py-3 flex items-center justify-between">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {totalItems === 0
              ? "Sin resultados"
              : `Mostrando ${startItem}–${endItem} de ${totalItems.toLocaleString()} productos`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || totalItems === 0}
              className="px-3 py-1.5 border border-outline-variant rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || totalItems === 0}
              className="px-3 py-1.5 border border-outline-variant rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InventarioTable;