"use client";

import { useEffect, useState } from "react";
import { fetchProductosApi, fetchProveedoresDelProductoApi, ProductoProveedorDetalle } from "../../api/Producto.api";
import { crearOrdenApi, fetchStockEnTransitoApi } from "../../api/OrdenCompra.api";
import { ProductoDetalle } from "../../types/Inventario.types";
import { useRouter } from "next/navigation";

interface AsignarStockModalProps {
  productoId: number;
  productoNombre: string;
  stockActual: number;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function AsignarStockModal({
  productoId,
  productoNombre,
  stockActual,
  onConfirm,
  onClose,
}: AsignarStockModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);

  const [proveedores, setProveedores] = useState<ProductoProveedorDetalle[]>([]);
  const [selectedProveedorId, setSelectedProveedorId] = useState<number | "">("");

  const [stockEnTransito, setStockEnTransito] = useState(0);
  const [cantidadAnadir, setCantidadAnadir] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar producto, proveedores y stock en tránsito en paralelo
        const [productosRes, provs, enTransito] = await Promise.all([
          fetchProductosApi({ limit: 200 }),
          fetchProveedoresDelProductoApi(productoId),
          fetchStockEnTransitoApi(productoId),
        ]);

        const prod = productosRes.data.find((p) => p.id === productoId);
        if (prod) setProducto(prod);

        setProveedores(provs);
        setStockEnTransito(enTransito);

        if (provs.length > 0) {
          const principal = provs.find((p) => p.esPrincipal);
          setSelectedProveedorId(
            principal ? principal.proveedorId : provs[0].proveedorId
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar datos del producto o proveedores"
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [productoId]);

  // ── Fórmula de Stock Sugerido ─────────────────────────────────────────────
  // stockReserva = stockMinimo (stock de seguridad mínimo a mantener)
  // stockDisponible = stock real disponible para vender (descontando reserva)
  // necesidadReal   = cuánto falta para llegar al máximo, sin contar lo que ya viene en camino
  // sugerenciaStock = Math.max(0, necesidadReal)
  const stockMaximo   = producto?.stockMaximo  ?? 0;
  const stockReserva  = producto?.stockMinimo  ?? 0;
  const stockDisponible  = stockActual;
  const necesidadReal    = stockMaximo - stockDisponible - stockEnTransito;
  const sugerenciaStock  = Math.max(0, necesidadReal);

  const handleAnadir = async () => {
    if (!selectedProveedorId) {
      setError("Debes seleccionar un proveedor.");
      return;
    }
    const cantidad = parseInt(cantidadAnadir);
    if (!cantidadAnadir || isNaN(cantidad) || cantidad <= 0) {
      setError("Ingresa una cantidad válida mayor a 0");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await crearOrdenApi({
        proveedorId: Number(selectedProveedorId),
        items: [{ productoId, cantidadSolicitada: cantidad }],
      });

      // Esperar a que onConfirm se complete (que incluye marcar la alerta como leída)
      if (onConfirm && typeof onConfirm === 'function') {
        await onConfirm();
      }
      
      // Navegar después de que se complete la acción
      router.push("/ordenes");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al generar la orden de compra"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="border-b border-outline-variant p-5 flex justify-between items-start">
          <div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface">
              Generar Orden de Compra
            </h2>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              {productoNombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-container rounded-md text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-surface-container rounded w-3/4" />
              <div className="h-4 bg-surface-container rounded w-1/2" />
              <div className="h-16 bg-surface-container rounded" />
            </div>
          ) : error ? (
            <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          ) : proveedores.length === 0 ? (
            <div className="p-4 rounded-lg bg-error-container/20 border border-error/30 text-center space-y-2">
              <span className="material-symbols-outlined text-[36px] text-error block">store_off</span>
              <p className="text-body-md text-error font-medium">Sin proveedores asignados</p>
              <p className="text-body-sm text-error/80">
                Este producto no tiene proveedores registrados. No es posible generar una orden de compra automáticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Selector de proveedor */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">
                  Proveedor
                </label>
                <div className="relative">
                  <select
                    value={selectedProveedorId}
                    onChange={(e) => setSelectedProveedorId(Number(e.target.value))}
                    className="appearance-none w-full border border-outline-variant rounded-lg pl-3 pr-8 py-2 text-body-md font-body-md text-on-surface focus:border-primary focus:outline-none bg-surface-container-low"
                  >
                    {proveedores.map((p) => (
                      <option key={p.proveedorId} value={p.proveedorId}>
                        {p.proveedorNombre} {p.esPrincipal ? "(Principal)" : ""}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Desglose de stock */}
              <div className="rounded-lg border border-outline-variant divide-y divide-outline-variant/50 text-body-sm font-body-sm">
                <div className="flex justify-between px-3 py-2">
                  <span className="text-on-surface-variant">Stock Actual</span>
                  <span className="font-medium text-on-surface">{stockActual} uds.</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-on-surface-variant">Stock de Reserva (mínimo)</span>
                  <span className="font-medium text-warning">− {stockReserva} uds.</span>
                </div>
                <div className="flex justify-between px-3 py-2 bg-surface-container-low">
                  <span className="text-on-surface-variant">Disponible Real</span>
                  <span className="font-semibold text-on-surface">{stockDisponible} uds.</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-on-surface-variant">Stock Máximo objetivo</span>
                  <span className="font-medium text-on-surface">{stockMaximo} uds.</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">local_shipping</span>
                    En tránsito (ya pedido)
                  </span>
                  <span className="font-medium text-primary">− {stockEnTransito} uds.</span>
                </div>
              </div>

              {/* Stock sugerido */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/25">
                <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">
                  Cantidad Sugerida a Ordenar
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-[28px] font-bold text-primary leading-none">
                    {sugerenciaStock}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">unidades</p>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-tight">
                  = Máx ({stockMaximo}) − Disponible ({stockDisponible}) − En tránsito ({stockEnTransito})
                </p>
                {sugerenciaStock === 0 && (
                  <p className="text-[11px] text-primary mt-1 font-medium">
                    ✓ El stock cubierto con lo disponible y en tránsito es suficiente para alcanzar el máximo.
                  </p>
                )}
              </div>

              {/* Input de cantidad */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">
                  Cantidad a Solicitar
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={cantidadAnadir}
                    onChange={(e) => setCantidadAnadir(e.target.value)}
                    placeholder="Ej: 50"
                    className="flex-1 border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:border-primary focus:outline-none"
                  />
                  {sugerenciaStock > 0 && (
                    <button
                      type="button"
                      onClick={() => setCantidadAnadir(sugerenciaStock.toString())}
                      disabled={submitting}
                      className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-label-sm font-label-sm hover:bg-primary/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      Usar {sugerenciaStock}
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="border-t border-outline-variant p-5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-label-md font-label-md hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleAnadir}
            disabled={submitting || loading || proveedores.length === 0 || !cantidadAnadir}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            )}
            {submitting ? "Generando..." : "Generar Orden"}
          </button>
        </div>
      </div>
    </div>
  );
}
