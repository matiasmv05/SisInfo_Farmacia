// app/(Pages)/ordenes/page.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchOrdenesApi,
  crearOrdenApi,
  emitirOrdenApi,
  cancelarOrdenApi,
} from "../../api/OrdenCompra.api";
import { buscarProductosApi } from "../../api/Producto.api";
import {
  OrdenCompraResponseDto,
  EstadoOrden,
  OrdenCompraItemRequestDto,
} from "../../types/OrdenCompra.types";

// ─── Helpers de estado ────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<
  EstadoOrden,
  { label: string; dot: string; badge: string }
> = {
  borrador:         { label: "Borrador",         dot: "bg-outline",   badge: "bg-surface-variant text-on-surface-variant" },
  emitida:          { label: "Emitida",           dot: "bg-primary",   badge: "bg-primary/10 text-primary" },
  recibida:         { label: "Recibida",          dot: "bg-secondary", badge: "bg-secondary-container text-on-secondary-container" },
  recibida_parcial: { label: "Recib. Parcial",    dot: "bg-[#d97706]", badge: "bg-[#d97706]/10 text-[#d97706]" },
  cancelada:        { label: "Cancelada",         dot: "bg-error",     badge: "bg-error-container text-on-error-container" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatMoney(n: number | null) {
  if (n == null) return "Bs 0.00";
  return `Bs ${Number(n).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Modal detalle ────────────────────────────────────────────────────────────
function DetalleModal({
  orden,
  onClose,
  onEmitir,
  onCancelar,
}: {
  orden: OrdenCompraResponseDto;
  onClose: () => void;
  onEmitir: (id: number) => Promise<void>;
  onCancelar: (id: number) => Promise<void>;
}) {
  const router = useRouter();
  const [acting, setActing] = useState(false);
  const cfg = ESTADO_CONFIG[orden.estado] ?? ESTADO_CONFIG.borrador;

  const handleEmitir = async () => {
    setActing(true);
    try { await onEmitir(orden.id); onClose(); }
    finally { setActing(false); }
  };

  const handleCancelar = async () => {
    if (!confirm("¿Cancelar esta orden? No se puede deshacer.")) return;
    setActing(true);
    try { await onCancelar(orden.id); onClose(); }
    finally { setActing(false); }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-outline-variant shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Orden #{orden.id}
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-label-sm text-label-sm font-bold ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              {orden.proveedorNombre} · Creada {formatDate(orden.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-body-sm">
            <div>
              <p className="text-on-surface-variant text-[11px] uppercase tracking-wide mb-0.5">Proveedor</p>
              <p className="font-medium text-on-surface">{orden.proveedorNombre}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-[11px] uppercase tracking-wide mb-0.5">Creado por</p>
              <p className="font-medium text-on-surface">{orden.usuarioNombre}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-[11px] uppercase tracking-wide mb-0.5">Monto Total</p>
              <p className="font-bold text-on-surface text-base">{formatMoney(orden.montoTotal)}</p>
            </div>
            {orden.fechaEmision && (
              <div>
                <p className="text-on-surface-variant text-[11px] uppercase tracking-wide mb-0.5">Fecha Emisión</p>
                <p className="text-on-surface">{formatDate(orden.fechaEmision)}</p>
              </div>
            )}
            {orden.fechaRecepcion && (
              <div>
                <p className="text-on-surface-variant text-[11px] uppercase tracking-wide mb-0.5">Fecha Recepción</p>
                <p className="text-on-surface">{formatDate(orden.fechaRecepcion)}</p>
              </div>
            )}
          </div>

          {orden.notas && (
            <div className="bg-surface-container rounded-lg px-4 py-3 text-body-sm text-on-surface-variant border border-outline-variant/50">
              <span className="font-medium text-on-surface">Notas: </span>{orden.notas}
            </div>
          )}

          {/* Tabla de ítems */}
          <div>
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-3">
              Ítems ({orden.items.length})
            </p>
            <div className="border border-outline-variant rounded-lg overflow-hidden">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface border-b border-outline-variant">
                  <tr>
                    <th className="py-2 px-3 font-label-sm text-label-sm text-on-surface-variant">Producto</th>
                    <th className="py-2 px-3 font-label-sm text-label-sm text-on-surface-variant text-right">Cantidad</th>
                    <th className="py-2 px-3 font-label-sm text-label-sm text-on-surface-variant text-right">Costo Unit.</th>
                    <th className="py-2 px-3 font-label-sm text-label-sm text-on-surface-variant text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {orden.items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container/40">
                      <td className="py-2.5 px-3 font-medium text-on-surface">{item.productoNombre}</td>
                      <td className="py-2.5 px-3 text-right font-data-mono">{item.cantidadSolicitada}</td>
                      <td className="py-2.5 px-3 text-right font-data-mono">
                        {item.costoUnitario != null ? formatMoney(item.costoUnitario) : <span className="text-on-surface-variant/50 italic">Sin costo</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-data-mono font-medium">
                        {item.costoUnitario != null
                          ? formatMoney(item.costoUnitario * item.cantidadSolicitada)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center shrink-0 gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container text-label-md font-label-md transition-colors">
            Cerrar
          </button>
          <div className="flex gap-2">
            {(orden.estado === "borrador" || orden.estado === "emitida") && (
              <button
                onClick={handleCancelar}
                disabled={acting}
                className="px-4 py-2 border border-error/40 text-error rounded hover:bg-error/5 text-label-md font-label-md transition-colors disabled:opacity-50"
              >
                Cancelar orden
              </button>
            )}
            {orden.estado === "borrador" && (
              <button
                onClick={handleEmitir}
                disabled={acting || orden.items.length === 0}
                className="px-5 py-2 bg-primary text-on-primary rounded text-label-md font-label-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {acting && <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
                Emitir orden
              </button>
            )}
            {(orden.estado === "emitida" || orden.estado === "recibida_parcial") && (
              <button
                onClick={() => router.push(`/recepcion?orderId=${orden.id}`)}
                className="px-5 py-2 bg-secondary text-on-secondary rounded text-label-md font-label-md hover:bg-secondary/90 flex items-center gap-2 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                Ingresar a Recepción
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal nueva orden ────────────────────────────────────────────────────────
interface NuevaOrdenForm {
  proveedorId: string;
  notas: string;
  items: { productoId: number; productoNombre: string; cantidad: string; costo: string }[];
}

function NuevaOrdenModal({
  proveedores,
  onClose,
  onCrear,
}: {
  proveedores: { id: number; nombre: string }[];
  onClose: () => void;
  onCrear: (data: { proveedorId: number; notas?: string; items: OrdenCompraItemRequestDto[] }) => Promise<void>;
}) {
  const [form, setForm] = useState<NuevaOrdenForm>({
    proveedorId: "",
    notas: "",
    items: [],
  });
  const [productoSearch, setProductoSearch] = useState("");
  const [productResults, setProductResults] = useState<{ id: number; nombre: string; laboratorio: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Buscar productos al tipear
  useEffect(() => {
    if (productoSearch.trim().length < 2) { setProductResults([]); return; }
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await buscarProductosApi(productoSearch);
        setProductResults(res);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [productoSearch]);

  const addItem = (prod: { id: number; nombre: string }) => {
    if (form.items.find((i) => i.productoId === prod.id)) return;
    setForm((f) => ({
      ...f,
      items: [...f.items, { productoId: prod.id, productoNombre: prod.nombre, cantidad: "1", costo: "" }],
    }));
    setProductoSearch("");
    setProductResults([]);
  };

  const removeItem = (idx: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const updateItem = (idx: number, field: "cantidad" | "costo", val: string) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proveedorId) return setError("Selecciona un proveedor.");
    if (form.items.length === 0) return setError("Agrega al menos un producto.");
    for (const item of form.items) {
      if (!item.cantidad || Number(item.cantidad) < 1)
        return setError(`Cantidad inválida en "${item.productoNombre}".`);
    }
    setSaving(true);
    try {
      await onCrear({
        proveedorId: Number(form.proveedorId),
        notas: form.notas.trim() || undefined,
        items: form.items.map((i) => ({
          productoId: i.productoId,
          cantidadSolicitada: Number(i.cantidad),
          costoUnitario: i.costo ? Number(i.costo) : undefined,
        })),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear orden");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Nueva Orden de Compra</h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5">Se crea en estado Borrador</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="nueva-orden-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex-1 space-y-5">
          {/* Proveedor */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">
              Proveedor <span className="text-error">*</span>
            </label>
            <select
              value={form.proveedorId}
              onChange={(e) => setForm((f) => ({ ...f, proveedorId: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface text-on-surface text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {/* Buscar productos */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">
              Agregar Productos
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={productoSearch}
                onChange={(e) => setProductoSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-outline-variant bg-surface text-on-surface text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                {searching ? "progress_activity" : "search"}
              </span>
              {productResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {productResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addItem(p)}
                      className="w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors"
                    >
                      <p className="text-body-sm font-medium text-on-surface">{p.nombre}</p>
                      <p className="text-[11px] text-on-surface-variant">{p.laboratorio}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lista de ítems */}
          {form.items.length > 0 && (
            <div className="border border-outline-variant rounded-lg overflow-hidden">
              <table className="w-full text-body-sm">
                <thead className="bg-surface border-b border-outline-variant">
                  <tr>
                    <th className="py-2 px-3 text-left font-label-sm text-on-surface-variant">Producto</th>
                    <th className="py-2 px-3 text-right font-label-sm text-on-surface-variant w-24">Cant.</th>
                    <th className="py-2 px-3 text-right font-label-sm text-on-surface-variant w-32">Costo (Bs)</th>
                    <th className="py-2 px-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {form.items.map((item, idx) => (
                    <tr key={item.productoId}>
                      <td className="py-2 px-3 font-medium text-on-surface">{item.productoNombre}</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => updateItem(idx, "cantidad", e.target.value)}
                          className="w-full text-right px-2 py-1 border border-outline-variant rounded bg-surface text-body-sm focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Opcional"
                          value={item.costo}
                          onChange={(e) => updateItem(idx, "costo", e.target.value)}
                          className="w-full text-right px-2 py-1 border border-outline-variant rounded bg-surface text-body-sm focus:outline-none focus:border-primary placeholder:text-outline/40"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button type="button" onClick={() => removeItem(idx)} className="text-error/60 hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notas */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">
              Notas <span className="text-outline/60 text-[11px]">(opcional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={form.notas}
              onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
              placeholder="Instrucciones especiales, referencias, etc."
              className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface text-on-surface text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none transition-colors"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between gap-3 shrink-0">
          {error ? (
            <p className="text-body-sm text-error flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          ) : <span />}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container text-label-md font-label-md disabled:opacity-40 transition-colors">
              Cancelar
            </button>
            <button type="submit" form="nueva-orden-form" disabled={saving}
              className="px-5 py-2 bg-primary text-on-primary rounded text-label-md font-label-md hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2 transition-colors">
              {saving && <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />}
              {saving ? "Creando..." : "Crear Orden"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function OrdenesPage() {
  const router = useRouter();
  const [ordenes, setOrdenes]       = useState<OrdenCompraResponseDto[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [estadoFilter, setEstadoFilter] = useState<EstadoOrden | "">("");
  const [search, setSearch]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [detalle, setDetalle]       = useState<OrdenCompraResponseDto | null>(null);
  const [showNueva, setShowNueva]   = useState(false);
  const [proveedores, setProveedores] = useState<{ id: number; nombre: string }[]>([]);
  const [proveedoresError, setProveedoresError] = useState<string | null>(null);
  const LIMIT = 20;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce búsqueda
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
  }, [search]);

  // Cargar órdenes
  const loadOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrdenesApi({ estado: estadoFilter, page: currentPage, limit: LIMIT });
      setOrdenes(res.data ?? []);
      setTotal(res.totalElements ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar órdenes");
    } finally {
      setLoading(false);
    }
  }, [estadoFilter, currentPage]);

  useEffect(() => { loadOrdenes(); }, [loadOrdenes]);
  useEffect(() => { setCurrentPage(0); }, [estadoFilter]);

  // Cargar proveedores para el modal
  useEffect(() => {
    const token = sessionStorage.getItem("farmacia_token") ?? localStorage.getItem("farmacia_token") ?? "";
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/proveedores?activo=true&page=0&limit=100`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((r) => {
        if (!r.ok) {
          if (r.status === 403) {
            throw new Error("No tienes permiso para ver proveedores");
          }
          throw new Error(`Error ${r.status} al cargar proveedores`);
        }
        return r.json();
      })
      .then((body) => {
        setProveedores(body.data ?? []);
        setProveedoresError(null);
      })
      .catch((err) => {
        console.error("Error cargando proveedores:", err);
        setProveedoresError(err instanceof Error ? err.message : "Error al cargar proveedores");
      });
  }, []);

  // Filtrar por búsqueda local (por proveedor o id)
  const filtered = ordenes.filter((o) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      o.proveedorNombre.toLowerCase().includes(q) ||
      String(o.id).includes(q)
    );
  });

  const totalPages = Math.ceil(total / LIMIT);

  const handleEmitir = async (id: number) => {
    const updated = await emitirOrdenApi(id);
    setOrdenes((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const handleCancelar = async (id: number) => {
    const updated = await cancelarOrdenApi(id);
    setOrdenes((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const handleCrear = async (data: Parameters<typeof crearOrdenApi>[0]) => {
    await crearOrdenApi(data);
    await loadOrdenes();
  };

  return (
    <>
      {detalle && (
        <DetalleModal
          orden={detalle}
          onClose={() => setDetalle(null)}
          onEmitir={handleEmitir}
          onCancelar={handleCancelar}
        />
      )}
      {showNueva && (
        <NuevaOrdenModal
          proveedores={proveedores}
          onClose={() => setShowNueva(false)}
          onCrear={handleCrear}
        />
      )}

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Órdenes de Compra
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {total > 0 ? `${total} órdenes en total` : "Administra el flujo de abastecimiento"}
            </p>
          </div>
          <button
            onClick={() => setShowNueva(true)}
            disabled={proveedoresError !== null}
            className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
            title={proveedoresError || "Crear nueva orden"}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva Orden
          </button>
        </div>

        {/* Error cargando proveedores */}
        {proveedoresError && (
          <div className="flex items-center gap-2 bg-error-container/20 border border-error/30 text-error rounded-lg px-4 py-3 text-body-sm">
            <span className="material-symbols-outlined text-[18px]">error_outline</span>
            <span>{proveedoresError}</span>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Buscar por proveedor o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-surface border border-outline-variant rounded text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Filtro estado — chips responsivos */}
          <div className="flex flex-wrap gap-2">
            {(["", "borrador", "emitida", "recibida", "cancelada"] as const).map((e) => {
              const isActive = estadoFilter === e;
              const label = e === "" ? "Todos" : ESTADO_CONFIG[e as EstadoOrden]?.label ?? e;
              return (
                <button
                  key={e}
                  onClick={() => setEstadoFilter(e)}
                  className={`px-3 py-1.5 rounded-full border text-label-sm font-label-sm transition-colors ${
                    isActive
                      ? "bg-primary text-on-primary border-primary"
                      : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-error-container/20 border border-error/30 text-error rounded-lg px-4 py-3 text-body-sm">
            <span className="material-symbols-outlined text-[18px]">error_outline</span>
            {error}
            <button onClick={loadOrdenes} className="ml-auto underline hover:no-underline text-label-sm">Reintentar</button>
          </div>
        )}

        {/* Tabla / Cards responsivos */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-body-md text-on-surface-variant animate-pulse">Cargando órdenes...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-40 block">receipt_long</span>
              <p className="mt-2 text-body-md">No se encontraron órdenes.</p>
            </div>
          ) : (
            <>
              {/* Vista tabla (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface border-b border-outline-variant">
                    <tr>
                      <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">ID</th>
                      <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Proveedor</th>
                      <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Creada</th>
                      <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Emisión</th>
                      <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">Total</th>
                      <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Ítems</th>
                      <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Estado</th>
                      <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {filtered.map((orden) => {
                      const cfg = ESTADO_CONFIG[orden.estado] ?? ESTADO_CONFIG.borrador;
                      return (
                        <tr key={orden.id} className="hover:bg-[#F0F7FF] transition-colors group">
                          <td className="py-3 px-4 font-data-mono text-data-mono text-outline">#{orden.id}</td>
                          <td className="py-3 px-4 font-medium text-on-surface">{orden.proveedorNombre}</td>
                          <td className="py-3 px-4 text-on-surface-variant text-body-sm">{formatDate(orden.createdAt)}</td>
                          <td className="py-3 px-4 text-on-surface-variant text-body-sm">{formatDate(orden.fechaEmision)}</td>
                          <td className="py-3 px-4 text-right font-data-mono text-data-mono">{formatMoney(orden.montoTotal)}</td>
                          <td className="py-3 px-4 text-on-surface-variant text-body-sm">{orden.items.length} items</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-label-sm text-label-sm font-bold ${cfg.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setDetalle(orden)}
                                title="Ver detalle"
                                className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded"
                              >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                              </button>
                              {orden.estado === "borrador" && (
                                <button
                                  onClick={async () => { await handleEmitir(orden.id); }}
                                  title="Emitir"
                                  className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded"
                                >
                                  <span className="material-symbols-outlined text-[20px]">send</span>
                                </button>
                              )}
                              {(orden.estado === "emitida" || orden.estado === "recibida_parcial") && (
                                <button
                                  onClick={() => router.push(`/recepcion?orderId=${orden.id}`)}
                                  title="Ingresar a Recepción"
                                  className="text-on-surface-variant hover:text-secondary transition-colors p-1 rounded"
                                >
                                  <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                                </button>
                              )}
                              {(orden.estado === "borrador" || orden.estado === "emitida") && (
                                <button
                                  onClick={async () => {
                                    if (confirm("¿Cancelar esta orden?")) await handleCancelar(orden.id);
                                  }}
                                  title="Cancelar"
                                  className="text-on-surface-variant hover:text-error transition-colors p-1 rounded"
                                >
                                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Vista cards (mobile) */}
              <div className="md:hidden divide-y divide-outline-variant/40">
                {filtered.map((orden) => {
                  const cfg = ESTADO_CONFIG[orden.estado] ?? ESTADO_CONFIG.borrador;
                  return (
                    <div
                      key={orden.id}
                      className="p-4 hover:bg-surface-container/50 transition-colors"
                      onClick={() => setDetalle(orden)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-on-surface">{orden.proveedorNombre}</p>
                          <p className="text-[11px] font-data-mono text-outline mt-0.5">#{orden.id} · {formatDate(orden.createdAt)}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-bold ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-body-sm text-on-surface-variant">{orden.items.length} ítems</span>
                        <span className="font-data-mono font-bold text-on-surface">{formatMoney(orden.montoTotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Paginación */}
          {!loading && total > 0 && (
            <div className="bg-surface border-t border-outline-variant px-4 py-3 flex items-center justify-between">
              <span className="text-body-sm text-on-surface-variant">
                {total === 0 ? "Sin resultados" : `${currentPage * LIMIT + 1}–${Math.min((currentPage + 1) * LIMIT, total)} de ${total}`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-40 text-label-sm font-label-sm transition-colors"
                >
                  Anterior
                </button>
                <span className="px-2 py-1.5 text-body-sm text-on-surface-variant">
                  {currentPage + 1} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1.5 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-40 text-label-sm font-label-sm transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}