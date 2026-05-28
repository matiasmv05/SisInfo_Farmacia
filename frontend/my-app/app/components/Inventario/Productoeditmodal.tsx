'use client';
// app/components/Inventario/ProductoEditModal.tsx

import { useEffect, useState } from 'react';
import { ProductoDetalle, CategoriaProducto } from '../../types/Inventario.types';

// Mapeamos el enum del backend a opciones legibles
const CATEGORIAS: { value: CategoriaProducto; label: string }[] = [
                { value: 'ANTIBIOTICOS',         label: 'Antibióticos' },
                { value: 'ANTIHIPERTENSIVOS',    label: 'Antihipertensivos' },
                { value: 'ANTIDIABETICOS',       label: 'Antidiabéticos' },
                { value: 'ANALGESICOS',          label: 'Analgésicos' },
                { value: 'ANTIINFLAMATORIOS',    label: 'Antiinflamatorios' },
                { value: 'ANTIHISTAMINICOS',     label: 'Antihistamínicos' },
                { value: 'ANTIGRIPALES',         label: 'Antigripales' },
                { value: 'PROTECTORES_GASTRICOS',label: 'Protectores Gástricos' },
                { value: 'CARDIOLOGICOS',        label: 'Cardiológicos' },
                { value: 'RESPIRATORIOS',        label: 'Respiratorios' },
                { value: 'DERMATOLOGICOS',       label: 'Dermatológicos' },
                { value: 'VITAMINAS_SUPLEMENTOS',label: 'Vitaminas y Suplementos' },
                { value: 'INSUMOS_MEDICOS',      label: 'Insumos Médicos' },
                { value: 'CUIDADO_PERSONAL',     label: 'Cuidado Personal' },
                { value: 'PEDIATRICO',           label: 'Pediátrico' },
                { value: 'ORTOPEDIA',            label: 'Ortopedia' },
                { value: 'OTROS',                label: 'Otros' },
];

interface Props {
  producto: ProductoDetalle;
  onClose: () => void;
  onSave: (id: number, payload: Partial<ProductoDetalle>) => Promise<void>;
}

interface FormState {
  nombre:           string;
  categoria:        CategoriaProducto | '';
  laboratorio:      string;
  concentracion:    string;
  presentacion:     string;
  precioCosto:      string;
  precioVenta:      string;
  stockMinimo:      string;
  stockMaximo:      string;
  diasMinimosVenta: string;
}

function toForm(p: ProductoDetalle): FormState {
  return {
    nombre:           p.nombre ?? '',
    categoria:        p.categoria ?? '',
    laboratorio:      p.laboratorio ?? '',
    concentracion:    p.concentracion ?? '',
    presentacion:     p.presentacion ?? '',
    precioCosto:      p.precioCosto != null ? String(p.precioCosto) : '',
    precioVenta:      String(p.precioVenta),
    stockMinimo:      String(p.stockMinimo),
    stockMaximo:      p.stockMaximo != null ? String(p.stockMaximo) : '',
    diasMinimosVenta: p.diasMinimosVenta != null ? String(p.diasMinimosVenta) : '',
  };
}

// ── Campo de texto reutilizable ───────────────────────────────────────────────
const Field = ({
  label, name, value, onChange, type = 'text', required = false, hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="font-label-sm text-label-sm text-on-surface-variant">
      {label}{required && <span className="text-status-critical ml-0.5">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      step={type === 'number' ? 'any' : undefined}
      min={type === 'number' ? '0' : undefined}
      className="
        w-full px-3 py-2 rounded-md border border-outline-variant bg-surface
        font-body-sm text-body-sm text-on-surface
        focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
        placeholder:text-outline/50
        transition-colors
      "
    />
    {hint && <p className="font-body-xs text-body-xs text-outline">{hint}</p>}
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
export default function ProductoEditModal({ producto, onClose, onSave }: Props) {
  const [form, setForm]       = useState<FormState>(() => toForm(producto));
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

 // Para inputs de texto y número
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

// Para selects
const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones mínimas del lado cliente
    if (!form.nombre.trim())   return setError('El nombre es obligatorio.');
    if (!form.categoria)       return setError('Seleccioná una categoría.');
    if (!form.laboratorio.trim()) return setError('El laboratorio es obligatorio.');
    if (Number(form.precioVenta) <= 0) return setError('El precio de venta debe ser mayor a 0.');
    if (Number(form.stockMinimo) < 0)  return setError('El stock mínimo no puede ser negativo.');

    const payload: Partial<ProductoDetalle> = {
      nombre:           form.nombre.trim(),
      categoria:        form.categoria as CategoriaProducto,
      laboratorio:      form.laboratorio.trim(),
      concentracion:    form.concentracion.trim() || undefined,
      presentacion:     form.presentacion.trim()  || undefined,
      precioCosto:      form.precioCosto  ? Number(form.precioCosto)  : undefined,
      precioVenta:      Number(form.precioVenta),
      stockMinimo:      Number(form.stockMinimo),
      stockMaximo:      form.stockMaximo      ? Number(form.stockMaximo)      : undefined,
      diasMinimosVenta: form.diasMinimosVenta ? Number(form.diasMinimosVenta) : undefined,
    };

    setSaving(true);
    try {
      await onSave(producto.id, payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar. Intentá de nuevo.');
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

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Editar Producto</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              ID #{producto.id} · Los cambios se aplican de inmediato
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <form id="edit-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex-1">
          <div className="space-y-5">

            {/* Identificación */}
            <section>
              <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-3">
                Identificación
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field
                    label="Nombre comercial" name="nombre"
                    value={form.nombre} onChange={handleChange} required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="categoria" className="font-label-sm text-label-sm text-on-surface-variant">
                    Categoría<span className="text-status-critical ml-0.5">*</span>
                  </label>
                  <select
                    id="categoria" name="categoria"
                     value={form.categoria} onChange={handleSelectChange} 
                    className="
                      w-full px-3 py-2 rounded-md border border-outline-variant bg-surface
                      font-body-sm text-body-sm text-on-surface
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                      transition-colors
                    "
                  >
                    <option value="" disabled>Seleccionar…</option>
                    {CATEGORIAS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <Field
                  label="Laboratorio / Fabricante" name="laboratorio"
                  value={form.laboratorio} onChange={handleChange} required
                />
                <Field
                  label="Concentración" name="concentracion"
                  value={form.concentracion} onChange={handleChange}
                  hint="Ej: 500mg, 10mg/ml"
                />
                <Field
                  label="Presentación" name="presentacion"
                  value={form.presentacion} onChange={handleChange}
                  hint="Ej: Caja x 10 tabletas"
                />
              </div>
            </section>

            <div className="border-t border-outline-variant/40" />

            {/* Precios */}
            <section>
              <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-3">
                Precios
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Costo unitario (Bs)" name="precioCosto" type="number"
                  value={form.precioCosto} onChange={handleChange}
                  hint="Precio de compra al proveedor"
                />
                <Field
                  label="Precio de venta (Bs)" name="precioVenta" type="number"
                  value={form.precioVenta} onChange={handleChange} required
                />
              </div>
            </section>

            <div className="border-t border-outline-variant/40" />

            {/* Stock */}
            <section>
              <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-3">
                Control de Stock
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field
                  label="Stock mínimo" name="stockMinimo" type="number"
                  value={form.stockMinimo} onChange={handleChange} required
                  hint="Dispara alerta de reposición"
                />
                <Field
                  label="Stock máximo" name="stockMaximo" type="number"
                  value={form.stockMaximo} onChange={handleChange}
                />
                <Field
                  label="Días mínimos venta" name="diasMinimosVenta" type="number"
                  value={form.diasMinimosVenta} onChange={handleChange}
                  hint="Para cálculo de reorden"
                />
              </div>
            </section>

          </div>
        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between gap-3 shrink-0">
          {error ? (
            <p className="font-body-sm text-body-sm text-status-critical flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          ) : (
            <span /> // spacer
          )}
          <div className="flex gap-3">
            <button
              type="button" onClick={onClose} disabled={saving}
              className="
                px-4 py-2 border border-outline-variant rounded-md
                font-label-md text-label-md text-on-surface-variant
                hover:bg-surface-container disabled:opacity-40
                transition-colors
              "
            >
              Cancelar
            </button>
            <button
              type="submit" form="edit-form" disabled={saving}
              className="
                px-5 py-2 bg-primary text-on-primary rounded-md
                font-label-md text-label-md
                hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors flex items-center gap-2
              "
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              )}
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}