"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { fetchOrdenesApi, fetchOrdenByIdApi } from "../../api/OrdenCompra.api";
import { registrarRecepcionApi, fetchRecepcionesPorOrdenApi } from "../../api/Recepcion.api";
import { OrdenCompraResponseDto, OrdenCompraItemDto } from "../../types/OrdenCompra.types";
import { RecepcionDetalleRequestDto, RecepcionMercaderiaResponseDto } from "../../types/Recepcion.types";

interface FormItem extends RecepcionDetalleRequestDto {
  productoNombre: string;
  cantidadSolicitada: number;
  pendiente: number;
}

export default function RecepcionPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompraResponseDto[]>([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [orderDetail, setOrderDetail] = useState<OrdenCompraResponseDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const searchParams = useSearchParams();
  
  const [recepcionesHistory, setRecepcionesHistory] = useState<RecepcionMercaderiaResponseDto[]>([]);

  const [items, setItems] = useState<FormItem[]>([]);
  const [observaciones, setObservaciones] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar órdenes en estado emitida y recibida_parcial
  const loadOrdenesPendientes = useCallback(async () => {
    setLoadingOrdenes(true);
    try {
      const [emitidas, parciales] = await Promise.all([
        fetchOrdenesApi({ estado: "emitida", limit: 100 }),
        fetchOrdenesApi({ estado: "recibida_parcial", limit: 100 })
      ]);
      setOrdenes([...emitidas.data, ...parciales.data].sort((a, b) => b.id - a.id));
    } catch (err) {
      setError("Error al cargar las órdenes pendientes.");
    } finally {
      setLoadingOrdenes(false);
    }
  }, []);

  useEffect(() => {
    loadOrdenesPendientes();
  }, [loadOrdenesPendientes]);

  useEffect(() => {
    const orderIdParam = searchParams.get("orderId");
    if (orderIdParam && !selectedOrderId) {
      setSelectedOrderId(orderIdParam);
    }
  }, [searchParams, selectedOrderId]);

  const loadOrderDetails = useCallback(async (orderId: number) => {
    setLoadingDetails(true);
    setError(null);
    setSuccess(null);
    try {
      const detail = await fetchOrdenByIdApi(orderId);
      setOrderDetail(detail);

      const history = await fetchRecepcionesPorOrdenApi({ ordenCompraId: orderId, limit: 100 });
      setRecepcionesHistory(history.data);

      // Calcular pendientes
      const counts: Record<number, number> = {};
      history.data.forEach(r => {
        r.items.forEach(item => {
          counts[item.ordenDetalleId] = (counts[item.ordenDetalleId] || 0) + item.cantidadRecibida;
        });
      });

      // Inicializar form solo con items no completos
      const pendingItems = detail.items
        .filter(item => {
           const rec = counts[item.id] || 0;
           return rec < item.cantidadSolicitada;
        })
        .map(item => ({
          ordenDetalleId: item.id,
          cantidadRecibida: 0,
          numeroLote: "",
          fechaVencimiento: "",
          observacionItem: "",
          productoNombre: item.productoNombre,
          cantidadSolicitada: item.cantidadSolicitada,
          pendiente: item.cantidadSolicitada - (counts[item.id] || 0),
        }));

      setItems(pendingItems);
      setObservaciones("");
    } catch (err) {
      setError("Error al cargar los detalles de la orden.");
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      loadOrderDetails(Number(selectedOrderId));
    } else {
      setOrderDetail(null);
      setRecepcionesHistory([]);
      setItems([]);
    }
  }, [selectedOrderId, loadOrderDetails]);

  const handleItemChange = (
    ordenDetalleId: number,
    field: keyof FormItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.ordenDetalleId === ordenDetalleId ? { ...item, [field]: value } : item))
    );
  };

  const handleClearRow = (ordenDetalleId: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.ordenDetalleId === ordenDetalleId
          ? { ...item, cantidadRecibida: 0, numeroLote: "", fechaVencimiento: "", observacionItem: "" }
          : item
      )
    );
  };

  const handleConfirm = async () => {
    setError(null);
    setSuccess(null);

    // Filtramos items que tengan cantidad > 0
    const itemsToSubmit = items.filter(i => i.cantidadRecibida > 0);
    
    if (itemsToSubmit.length === 0) {
      setError("Debe ingresar al menos un ítem para recepcionar (cantidad > 0).");
      return;
    }

    // Validar lote y vencimiento de los que se van a recepcionar
    for (const item of itemsToSubmit) {
      if (item.cantidadRecibida > item.pendiente) {
        setError(`La cantidad a recibir de ${item.productoNombre} no puede superar el pendiente (${item.pendiente}).`);
        return;
      }
      if (!item.numeroLote.trim()) {
        setError(`Ingrese el lote para ${item.productoNombre}.`);
        return;
      }
      if (!item.fechaVencimiento) {
        setError(`Ingrese la fecha de vencimiento para ${item.productoNombre}.`);
        return;
      }
      
      const today = new Date();
      // Ajustar la fecha actual a la zona horaria local en formato YYYY-MM-DD
      const todayString = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
        
      if (item.fechaVencimiento <= todayString) {
        setError(`La fecha de vencimiento de ${item.productoNombre} debe ser en el futuro (después de hoy).`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await registrarRecepcionApi({
        ordenCompraId: Number(selectedOrderId),
        observaciones: observaciones.trim() || undefined,
        items: itemsToSubmit.map(i => ({
          ordenDetalleId: i.ordenDetalleId,
          cantidadRecibida: Number(i.cantidadRecibida),
          numeroLote: i.numeroLote.trim(),
          fechaVencimiento: i.fechaVencimiento,
          observacionItem: i.observacionItem?.trim() || undefined,
        })),
      });

      // Recargar estado actualizado de la orden inmediatamente
      const updatedOrder = await fetchOrdenByIdApi(Number(selectedOrderId));
      
      if (updatedOrder.estado === 'recibida') {
        setSuccess("✓ Orden completamente recibida. Seleccione otra orden.");
        setSelectedOrderId("");
        loadOrdenesPendientes();
      } else {
        setSuccess("Recepción registrada con éxito.");
        setOrderDetail(updatedOrder);
        
        // Recalcular items pendientes con la información actualizada
        const history = await fetchRecepcionesPorOrdenApi({ ordenCompraId: Number(selectedOrderId), limit: 100 });
        setRecepcionesHistory(history.data);

        const counts: Record<number, number> = {};
        history.data.forEach(r => {
          r.items.forEach(item => {
            counts[item.ordenDetalleId] = (counts[item.ordenDetalleId] || 0) + item.cantidadRecibida;
          });
        });

        const pendingItems = updatedOrder.items
          .filter(item => {
             const rec = counts[item.id] || 0;
             return rec < item.cantidadSolicitada;
          })
          .map(item => ({
            ordenDetalleId: item.id,
            cantidadRecibida: 0,
            numeroLote: "",
            fechaVencimiento: "",
            observacionItem: "",
            productoNombre: item.productoNombre,
            cantidadSolicitada: item.cantidadSolicitada,
            pendiente: item.cantidadSolicitada - (counts[item.id] || 0),
          }));

        setItems(pendingItems);
        loadOrdenesPendientes();
      }
    } catch (err: any) {
      setError(err.message || "Error al registrar la recepción.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-BO", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Recepción de Mercadería
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Procese órdenes de compra emitidas e ingrese los lotes al inventario.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container border border-error/30 flex items-center gap-2 font-body-sm shadow-sm animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-secondary-container text-on-secondary-container border border-secondary/30 flex items-center gap-2 font-body-sm shadow-sm animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined">check_circle</span>
          {success}
        </div>
      )}

      {/* Grid: Select Order & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Order Selection */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
          <label className="block font-label-md text-label-md text-on-surface mb-3 uppercase tracking-wide">
            Órdenes Pendientes
          </label>
          <div className="relative flex-1">
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              disabled={loadingOrdenes}
              className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-4 py-3 pr-10 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow cursor-pointer disabled:opacity-50"
            >
              <option disabled value="">
                {loadingOrdenes ? "Cargando órdenes..." : "Seleccione una Orden..."}
              </option>
              {ordenes.map(o => (
                <option key={o.id} value={o.id}>
                  #{o.id} - {o.proveedorNombre} ({o.estado === 'emitida' ? 'Nueva' : 'Parcial'})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">
              arrow_drop_down
            </span>
          </div>
          {ordenes.length === 0 && !loadingOrdenes && (
            <p className="mt-3 text-body-sm text-outline">No hay órdenes pendientes de recepción.</p>
          )}
        </div>

        {/* Order Details */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-center min-h-[160px]">
          {loadingDetails ? (
             <div className="flex items-center justify-center gap-3 text-primary animate-pulse">
               <span className="material-symbols-outlined animate-spin">progress_activity</span>
               <span>Cargando detalles...</span>
             </div>
          ) : orderDetail ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">
                  description
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Orden #{orderDetail.id}
                </h3>
                <span className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider ${
                  orderDetail.estado === 'emitida' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-[#d97706]/10 text-[#d97706]'
                }`}>
                  {orderDetail.estado === 'emitida' ? 'Emitida' : 'Recibida Parcial'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                    Proveedor
                  </span>
                  <span className="block font-body-md text-body-md text-on-surface font-medium mt-1 truncate" title={orderDetail.proveedorNombre}>
                    {orderDetail.proveedorNombre}
                  </span>
                </div>
                <div>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                    Emisión
                  </span>
                  <span className="block font-body-md text-body-md text-on-surface font-medium mt-1">
                    {formatDate(orderDetail.fechaEmision)}
                  </span>
                </div>
                <div>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                    Total Items
                  </span>
                  <span className="block font-body-md text-body-md text-on-surface font-medium mt-1">
                    {orderDetail.items.length} SKUs
                  </span>
                </div>
                <div>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                    Estado Actual
                  </span>
                  <span className="block font-body-md text-body-md text-on-surface font-medium mt-1">
                    {items.length === 0 ? "Completada" : `${items.length} Pendientes`}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center text-on-surface-variant font-body-md h-full">
              Seleccione una orden para ver los detalles.
            </div>
          )}
        </div>
      </div>

      {orderDetail && (
        <div className="space-y-8">
          
          {/* Formulario Checklist */}
          {items.length > 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Ingreso de Mercadería
                </h3>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface border-b border-outline-variant">
                      <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider">Producto</th>
                      <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider text-right w-28">Pendiente</th>
                      <th className="py-3 px-4 font-label-md text-primary uppercase tracking-wider text-right w-36 bg-primary/5">Recibir</th>
                      <th className="py-3 px-4 font-label-md text-primary uppercase tracking-wider w-40 bg-primary/5">Lote *</th>
                      <th className="py-3 px-4 font-label-md text-primary uppercase tracking-wider w-40 bg-primary/5">Vence *</th>
                      <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {items.map((item) => (
                      <tr key={item.ordenDetalleId} className="hover:bg-surface-container/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-on-surface">{item.productoNombre}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-data-mono font-medium text-outline">
                          {item.pendiente}
                        </td>
                        <td className="py-2 px-4 bg-primary/5">
                          <input
                            type="number"
                            min="0"
                            max={item.pendiente}
                            className="w-full text-right bg-surface border border-outline-variant rounded px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary font-data-mono"
                            value={item.cantidadRecibida || ""}
                            onChange={(e) => handleItemChange(item.ordenDetalleId, "cantidadRecibida", Number(e.target.value))}
                          />
                        </td>
                        <td className="py-2 px-4 bg-primary/5">
                          <input
                            type="text"
                            placeholder="Ej: L-123"
                            className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary font-data-mono uppercase"
                            value={item.numeroLote}
                            onChange={(e) => handleItemChange(item.ordenDetalleId, "numeroLote", e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-4 bg-primary/5">
                          <input
                            type="date"
                            className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary font-data-mono text-sm"
                            value={item.fechaVencimiento}
                            onChange={(e) => handleItemChange(item.ordenDetalleId, "fechaVencimiento", e.target.value)}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleClearRow(item.ordenDetalleId)} className="text-outline hover:text-error transition-colors p-1" title="Limpiar fila">
                            <span className="material-symbols-outlined text-[20px]">clear</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="lg:hidden flex flex-col divide-y divide-outline-variant/50">
                {items.map((item) => (
                  <div key={item.ordenDetalleId} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-on-surface">{item.productoNombre}</div>
                      <div className="text-label-sm font-label-sm bg-surface-container px-2 py-1 rounded">
                        Pendiente: <span className="font-data-mono font-bold">{item.pendiente}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-label-sm text-primary uppercase block mb-1">Recibir</label>
                        <input
                          type="number"
                          min="0"
                          max={item.pendiente}
                          className="w-full bg-surface border border-outline-variant rounded px-2 py-2 focus:border-primary focus:ring-1 focus:ring-primary font-data-mono text-center"
                          value={item.cantidadRecibida || ""}
                          onChange={(e) => handleItemChange(item.ordenDetalleId, "cantidadRecibida", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-label-sm text-primary uppercase block mb-1">Lote *</label>
                        <input
                          type="text"
                          className="w-full bg-surface border border-outline-variant rounded px-2 py-2 focus:border-primary focus:ring-1 focus:ring-primary font-data-mono uppercase"
                          value={item.numeroLote}
                          onChange={(e) => handleItemChange(item.ordenDetalleId, "numeroLote", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-label-sm text-primary uppercase block mb-1">Vencimiento *</label>
                        <input
                          type="date"
                          className="w-full bg-surface border border-outline-variant rounded px-2 py-2 focus:border-primary focus:ring-1 focus:ring-primary font-data-mono"
                          value={item.fechaVencimiento}
                          onChange={(e) => handleItemChange(item.ordenDetalleId, "fechaVencimiento", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Observación del ítem (opcional)"
                          className="flex-1 bg-surface border border-outline-variant rounded px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary font-body-sm"
                          value={item.observacionItem || ""}
                          onChange={(e) => handleItemChange(item.ordenDetalleId, "observacionItem", e.target.value)}
                        />
                        <button onClick={() => handleClearRow(item.ordenDetalleId)} className="p-2 text-outline hover:text-error bg-surface-container rounded transition-colors">
                          <span className="material-symbols-outlined">clear</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Observaciones generales */}
              <div className="p-6 border-t border-outline-variant bg-surface-container-lowest">
                <label className="block font-headline-sm text-headline-sm text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">edit_note</span>
                  Observaciones Generales de la Recepción
                </label>
                <textarea
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Detalle cualquier novedad en la entrega general..."
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                ></textarea>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider rounded-lg hover:bg-primary/90 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined">check_circle</span>
                    )}
                    {isSubmitting ? "Procesando..." : "Confirmar Recepción"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-secondary-container/20 border border-secondary/30 rounded-xl p-8 text-center animate-in zoom-in-95">
              <span className="material-symbols-outlined text-[48px] text-secondary mb-3">inventory_2</span>
              <h3 className="font-headline-sm text-on-surface mb-1">Orden Completada</h3>
              <p className="text-body-md text-on-surface-variant">Todos los ítems de esta orden de compra ya han sido recepcionados.</p>
            </div>
          )}

          {/* Historial de Recepciones */}
          {recepcionesHistory.length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">history</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Historial de Recepciones</h3>
                <span className="ml-auto bg-surface-variant text-on-surface-variant px-2.5 py-0.5 rounded-full text-label-sm">{recepcionesHistory.length}</span>
              </div>
              <div className="divide-y divide-outline-variant/50">
                {recepcionesHistory.map(hist => (
                  <div key={hist.id} className="p-5 flex flex-col md:flex-row gap-4 hover:bg-surface-container/20 transition-colors">
                    <div className="md:w-1/4 shrink-0 border-l-4 border-secondary pl-3">
                      <p className="font-label-sm text-secondary uppercase tracking-wide mb-1">Rec #{hist.id}</p>
                      <p className="font-medium text-on-surface">{formatDate(hist.fechaHora)}</p>
                      <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">person</span> {hist.usuarioNombre}
                      </p>
                    </div>
                    <div className="md:w-3/4 flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {hist.items.map(hi => (
                          <span key={hi.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-lg border border-outline-variant/50 text-body-sm">
                            <span className="font-medium text-on-surface">{hi.productoNombre}</span>
                            <span className="text-primary font-data-mono bg-primary/10 px-1.5 py-0.5 rounded">+{hi.cantidadRecibida}</span>
                          </span>
                        ))}
                      </div>
                      {hist.observaciones && (
                        <p className="text-body-sm text-on-surface-variant bg-surface p-3 rounded-lg border border-outline-variant/30 italic">
                          "{hist.observaciones}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
