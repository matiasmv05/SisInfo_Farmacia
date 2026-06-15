"use client";

import React, { useState, useCallback } from "react";
import { salidaApi, fetchLotesProductoApi } from "../../api/Movimiento.api";
import { LoteDetalleDto } from "../../types/Movimiento.types";
import ProductSearch from "../../components/Movimiento/ProductSearch";
import LoteCard from "../../components/Movimiento/LoteCard";
import CartSummary, { CartItem } from "../../components/Movimiento/CartSummary";
import HistorialModal from "../../components/Movimiento/HistorialModal";

interface ProductoResumen {
  id: number;
  nombre: string;
  laboratorio: string;
  stockTotal: number;
  categoria: string;
  presentacion: string;
}

export default function SalidaInventarioPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductoResumen | null>(null);
  const [lotes, setLotes] = useState<LoteDetalleDto[]>([]);
  const [loadingLotes, setLoadingLotes] = useState(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"stock" | "fefo" | "generic">("generic");
  const [success, setSuccess] = useState<string | null>(null);
  const [showAllLotes, setShowAllLotes] = useState(false);
  const [historialProductoId, setHistorialProductoId] = useState<{ id: number; nombre: string } | null>(null);

  const loadLotes = useCallback(async (productoId: number) => {
    setLoadingLotes(true);
    try {
      const res = await fetchLotesProductoApi({ productoId, limit: 50 });
      setLotes(res.data.filter(l => l.estado === "activo" && l.cantidad > 0));
    } catch {
      setError("Error al cargar lotes del producto.");
    } finally {
      setLoadingLotes(false);
    }
  }, []);

  const handleSelectProduct = useCallback((p: ProductoResumen) => {
    setSelectedProduct(p);
    setQuantity(0);
    setShowAllLotes(false);
    setError(null);
    setSuccess(null);
    loadLotes(p.id);
  }, [loadLotes]);

  const fefoLote = lotes.length > 0 ? lotes[0] : null;
  const maxQty = selectedProduct?.stockTotal ?? 0;

  const handleAddToCart = () => {
    if (!selectedProduct || quantity <= 0) return;
    if (quantity > maxQty) {
      setError(`Cantidad supera el stock disponible (${maxQty}).`);
      return;
    }
    setError(null);
    setCart(prev => {
      const existing = prev.find(i => i.productoId === selectedProduct.id);
      if (existing) {
        return prev.map(i => i.productoId === selectedProduct.id ? { ...i, cantidad: i.cantidad + quantity } : i);
      }
      return [...prev, { productoId: selectedProduct.id, productoNombre: selectedProduct.nombre, cantidad: quantity }];
    });
    setQuantity(0);
    setSuccess(`${quantity} uds de ${selectedProduct.nombre} añadidas.`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRemoveFromCart = (productoId: number) => {
    setCart(prev => prev.filter(i => i.productoId !== productoId));
  };

  const handleConfirm = async () => {
    if (cart.length === 0) return;
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      for (const item of cart) {
        await salidaApi({ productoId: item.productoId, cantidad: item.cantidad });
      }
      setSuccess("Salida de inventario registrada exitosamente.");
      setCart([]);
      setSelectedProduct(null);
      setLotes([]);
    } catch (err: any) {
      const msg: string = err.message || "Error al procesar la salida.";
      // Detectar tipo de error para diferenciar el banner
      if (msg.includes("aptas para venta") || msg.includes("per\u00edodo m\u00ednimo")) {
        setErrorType("fefo");
      } else if (msg.includes("Stock insuficiente") || msg.includes("Disponible:")) {
        setErrorType("stock");
      } else {
        setErrorType("generic");
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {historialProductoId && (
        <HistorialModal
          productoId={historialProductoId.id}
          productoNombre={historialProductoId.nombre}
          onClose={() => setHistorialProductoId(null)}
        />
      )}

      <div className="flex flex-col gap-6 h-full">
        {/* Header */}
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Salida de Inventario</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Registre salidas de stock con selección automática FEFO (First Expired, First Out).
          </p>
        </div>

        {/* Notifications */}
        {error && (
          errorType === "fefo" ? (
            // Error FEFO: lotes con restricción por período mínimo de vencimiento
            <div className="rounded-xl border border-warning/40 bg-warning-container/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3 bg-warning-container/20 border-b border-warning/20">
                <span className="material-symbols-outlined text-warning text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>timer_off</span>
                <p className="font-label-md text-warning font-semibold">Stock con restricción de fecha</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="font-body-sm text-on-surface leading-relaxed">{error}</p>
                <p className="font-body-xs text-on-surface-variant">
                  Los lotes cuya fecha de vencimiento es menor o igual al período mínimo configurado para el producto no pueden despacharse, ya que no llegarán en condiciones al cliente.
                </p>
              </div>
            </div>
          ) : errorType === "stock" ? (
            // Error de stock insuficiente puro
            <div className="rounded-xl border border-error/40 bg-error-container/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3 bg-error-container/20 border-b border-error/20">
                <span className="material-symbols-outlined text-error text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>production_quantity_limits</span>
                <p className="font-label-md text-error font-semibold">Stock insuficiente</p>
              </div>
              <div className="px-4 py-3">
                <p className="font-body-sm text-on-surface leading-relaxed">{error}</p>
              </div>
            </div>
          ) : (
            // Error genérico
            <div className="p-4 rounded-lg bg-error-container text-on-error-container border border-error/30 flex items-center gap-2 font-body-sm shadow-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )
        )}
        {success && (
          <div className="p-4 rounded-lg bg-secondary-container text-on-secondary-container border border-secondary/30 flex items-center gap-2 font-body-sm shadow-sm">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {success}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left: Search & Product */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            {/* Search */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <ProductSearch onSelect={handleSelectProduct} />
            </div>

            {/* Product Detail */}
            {selectedProduct && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Product Header */}
                <div className="p-6 border-b border-outline-variant bg-surface flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-primary-container/20 text-primary text-label-sm font-label-sm rounded uppercase tracking-wide">
                        {selectedProduct.categoria}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{selectedProduct.nombre}</h3>
                    <p className="font-body-sm text-on-surface-variant mt-1">{selectedProduct.laboratorio} · {selectedProduct.presentacion}</p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="font-label-md text-on-surface-variant uppercase mb-1">Stock Total</p>
                    <p className="font-headline-sm text-primary">
                      {selectedProduct.stockTotal} <span className="text-body-sm text-on-surface-variant font-normal">uds</span>
                    </p>
                  </div>
                </div>

                {/* Body: FEFO + Quantity */}
                <div className="p-6 flex flex-col gap-5 flex-1">
                  {loadingLotes ? (
                    <div className="flex items-center justify-center py-8 text-primary">
                      <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> Cargando lotes...
                    </div>
                  ) : lotes.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] opacity-30 block mb-2">inventory</span>
                      No hay lotes activos con stock disponible.
                    </div>
                  ) : (
                    <>
                      {/* FEFO Lote */}
                      {fefoLote && <LoteCard lote={fefoLote} isFirst={true} />}

                      {/* Other Lotes */}
                      {lotes.length > 1 && (
                        <div>
                          <button
                            onClick={() => setShowAllLotes(!showAllLotes)}
                            className="text-primary hover:bg-primary-container/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-sm font-medium"
                          >
                            <span className="material-symbols-outlined text-[18px]">{showAllLotes ? "expand_less" : "expand_more"}</span>
                            {showAllLotes ? "Ocultar" : `Ver ${lotes.length - 1} lotes más`}
                          </button>
                          {showAllLotes && (
                            <div className="mt-3 space-y-3">
                              {lotes.slice(1).map(l => (
                                <LoteCard key={l.id} lote={l} isFirst={false} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <hr className="border-outline-variant" />

                      {/* Quantity + Add */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                        <div className="flex-1">
                          <label className="block font-label-md text-on-surface-variant mb-2">
                            Cantidad a Salir (Unidades)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max={maxQty}
                              value={quantity || ""}
                              onChange={(e) => setQuantity(Number(e.target.value))}
                              className="w-full pl-4 pr-20 py-3 bg-surface border border-outline-variant rounded-lg font-data-mono text-headline-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-sm">
                              / {maxQty} MAX
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleAddToCart}
                          disabled={!quantity || quantity <= 0}
                          className="bg-primary text-on-primary hover:bg-primary/90 py-3 px-6 rounded-lg font-label-md uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                          Añadir
                        </button>
                      </div>

                      {/* History button */}
                      <button
                        onClick={() => setHistorialProductoId({ id: selectedProduct.id, nombre: selectedProduct.nombre })}
                        className="self-start text-primary hover:bg-primary-container/10 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px]">history</span>
                        Ver historial de movimientos
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Cart */}
          <div className="xl:col-span-5 xl:sticky xl:top-0 xl:self-start" style={{ maxHeight: "calc(100vh - 120px)" }}>
            <CartSummary
              items={cart}
              onRemove={handleRemoveFromCart}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </>
  );
}
