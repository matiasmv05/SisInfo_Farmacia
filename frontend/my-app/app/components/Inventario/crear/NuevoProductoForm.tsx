// app/components/Inventario/crear/NuevoProductoForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import type { NuevoProductoForm as NuevoProductoFormType } from '../../../types/Producto.types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNuevoProducto } from '../../../context/NuevoProductoContext';
import { fetchProveedoresActivosApi } from '../../../api/Proveedor.api';
import type { ProveedorResponse } from '../../../types/Proveedor.types';

// ————— Sub-componente: Input de texto / número —————
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  required?: boolean;
  prefix?: string;
}
const FormInput: React.FC<FormInputProps> = ({ id, label, required, prefix, className, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="font-label-sm text-label-sm text-on-surface-variant">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-data-mono text-data-mono text-on-surface-variant select-none pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        className={`h-row_height_dense bg-surface-container-lowest border border-outline-variant rounded-md font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full ${
          prefix ? 'pl-10 pr-3' : 'px-3'
        } ${className ?? ''}`}
        {...props}
      />
    </div>
  </div>
);

// ————— Sub-componente: Input con sugerencias (datalist) —————
interface FormDatalistProps {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  suggestions: { value: string; label: string }[];
  placeholder?: string;
}
const FormInputDatalist: React.FC<FormDatalistProps> = ({ id, label, required, value, onChange, suggestions, placeholder }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="font-label-sm text-label-sm text-on-surface-variant">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <input
      id={id}
      list={`${id}-list`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-row_height_dense px-3 bg-surface-container-lowest border border-outline-variant rounded-md font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full"
    />
    <datalist id={`${id}-list`}>
      {suggestions.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </datalist>
  </div>
);

// ————— Sub-componente: Select —————
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
}
const FormSelect: React.FC<FormSelectProps> = ({ id, label, required, options, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="font-label-sm text-label-sm text-on-surface-variant">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <div className="relative">
      <select
        id={id}
        className="h-row_height_dense px-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded-md font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full appearance-none"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.value === ''}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-[20px]">expand_more</span>
      </div>
    </div>
  </div>
);

// ————— Sección con título separador —————
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider border-b border-surface-variant pb-2">
      {title}
    </h3>
    {children}
  </div>
);

// ————— Sugerencias de presentación —————
const PRESENTACION_SUGERENCIAS = [
  { value: 'Tabletas',            label: 'Tabletas' },
  { value: 'Cápsulas',            label: 'Cápsulas' },
  { value: 'Jarabe',              label: 'Jarabe' },
  { value: 'Ampolla Inyectable',  label: 'Ampolla Inyectable' },
  { value: 'Crema / Ungüento',    label: 'Crema / Ungüento' },
  { value: 'Gotas',               label: 'Gotas' },
  { value: 'Suspensión',          label: 'Suspensión' },
  { value: 'Parche Transdérmico', label: 'Parche Transdérmico' },
  { value: 'Supositorio',         label: 'Supositorio' },
  { value: 'Polvo para Solución', label: 'Polvo para Solución' },
];

// ————— Formulario principal —————
export const NuevoProductoForm: React.FC = () => {
  const router = useRouter();
  const { form, isSubmitting, submitError, lastCreated, updateField, resetForm, submitForm } = useNuevoProducto();

  // Estado de proveedores
  const [proveedores, setProveedores]           = useState<ProveedorResponse[]>([]);
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [errorProveedores, setErrorProveedores] = useState(false);

  useEffect(() => {
    fetchProveedoresActivosApi()

      .then(setProveedores)
      .catch(() => setErrorProveedores(true))
      .finally(() => setLoadingProveedores(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const handleCancel = () => router.push('/inventario');

  // ————— Pantalla de éxito —————
  if (lastCreated) {
    return (
      <div className="max-w-5xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-12 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">¡Producto Guardado!</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              <span className="font-semibold text-on-surface">{lastCreated.nombre}</span>{' '}
              fue registrado con el código{' '}
              <span className="font-data-mono text-data-mono text-primary">#{lastCreated.id}</span>
            </p>
          </div>
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-primary text-primary bg-surface-container-lowest rounded-md font-label-md text-label-md hover:bg-surface-container transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Añadir otro producto
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-primary text-on-primary rounded-md font-label-md text-label-md hover:bg-primary/90 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Volver a Inventario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      {/* Encabezado */}
      <div className="px-8 py-6 border-b border-outline-variant bg-surface">
        <h2 className="font-headline-md text-headline-md text-on-surface">Añadir Nuevo Producto</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Complete los detalles clínicos y comerciales para registrar un nuevo ítem en el catálogo.
        </p>
      </div>

      <form className="p-8 space-y-8" onSubmit={handleSubmit} noValidate>

        {/* ── Sección 1: Identificación Comercial ── */}
        <FormSection title="Identificación Comercial">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <FormInput
                id="nombreComercial" label="Nombre Comercial" required type="text"
                placeholder="Ej. Amoxicilina 500mg"
                value={form.nombreComercial}
                onChange={(e) => updateField('nombreComercial', e.target.value)}
              />
            </div>
            <FormSelect
              id="categoria" label="Categoría" required
              value={form.categoria}
              onChange={(e) => updateField('categoria', e.target.value as NuevoProductoFormType['categoria'])}
              options={[
                { value: '',                    label: 'Seleccione categoría...' },
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
              ]}
            />
            <FormInput
              id="laboratorio" label="Laboratorio / Fabricante" required type="text"
              placeholder="Ej. Bayer, Pfizer"
              value={form.laboratorio}
              onChange={(e) => updateField('laboratorio', e.target.value)}
            />
          </div>
        </FormSection>

        {/* ── Sección 2: Proveedor ── */}
        <FormSection title="Información del Proveedor">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="proveedorId" className="font-label-sm text-label-sm text-on-surface-variant">
              Proveedor <span className="text-error">*</span>
            </label>

            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              {/* ── Select de proveedores ── */}
              <div className="relative flex-1 w-full">
                <select
                  id="proveedorId"
                  value={form.proveedorId}
                  disabled={loadingProveedores || proveedores.length === 0}
                  onChange={(e) =>
                    updateField('proveedorId', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-row_height_dense px-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded-md font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {loadingProveedores
                      ? 'Cargando proveedores...'
                      : proveedores.length === 0
                      ? 'Sin proveedores — crea uno primero'
                      : 'Seleccione un proveedor...'}
                  </option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                      {p.contactoNombre ? ` — ${p.contactoNombre}` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              </div>

              {/* ── Botón crear proveedor ── */}
              <Link
                href="/proveedores/crear"
                className="flex items-center gap-2 px-4 h-row_height_dense border border-primary text-primary bg-surface-container-lowest rounded-md font-label-md text-label-md hover:bg-surface-container transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Nuevo Proveedor
              </Link>
            </div>

            {/* ── Estados del selector ── */}
            {loadingProveedores && (
              <div className="flex items-center gap-2 mt-1">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="font-body-sm text-body-sm text-on-surface-variant">Cargando proveedores...</p>
              </div>
            )}

            {!loadingProveedores && errorProveedores && (
              <div className="flex items-center gap-2 mt-1 p-3 bg-error-container border border-error/20 rounded-lg">
                <span className="material-symbols-outlined text-[16px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                <p className="font-body-sm text-body-sm text-on-error-container">
                  No se pudieron cargar los proveedores.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorProveedores(false);
                      setLoadingProveedores(true);
                      fetchProveedoresActivosApi()
                        .then(setProveedores)
                        .catch(() => setErrorProveedores(true))
                        .finally(() => setLoadingProveedores(false));
                    }}
                    className="underline font-medium text-error hover:opacity-80"
                  >
                    Reintentar
                  </button>
                </p>
              </div>
            )}

            {!loadingProveedores && !errorProveedores && proveedores.length === 0 && (
              <div className="flex items-start gap-2 mt-1 p-3 bg-tertiary-fixed border border-tertiary/20 rounded-lg">
                <span className="material-symbols-outlined text-[16px] text-tertiary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  info
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  No hay proveedores registrados. Debes{' '}
                  <Link href="/proveedores/crear" className="text-primary font-medium hover:underline">
                    crear un proveedor
                  </Link>{' '}
                  antes de registrar un producto.
                </p>
              </div>
            )}
          </div>
        </FormSection>

        {/* ── Sección 3: Especificaciones Clínicas ── */}
        <FormSection title="Especificaciones Clínicas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              id="concentracion" label="Concentración" type="text"
              placeholder="Ej. 500 mg, 10 ml/mg"
              value={form.concentracion}
              onChange={(e) => updateField('concentracion', e.target.value)}
            />
            <FormInputDatalist
              id="presentacion" label="Presentación" required
              value={form.presentacion}
              onChange={(val) => updateField('presentacion', val)}
              placeholder="Ej. Tabletas, Jarabe, Ampolla..."
              suggestions={PRESENTACION_SUGERENCIAS}
            />
          </div>
        </FormSection>

        {/* ── Sección 4: Control de Inventario y Precios ── */}
        <FormSection title="Control de Inventario y Precios">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              id="costoUnitario" label="Costo Unitario (Bs)" required
              type="number" min={0.01} step={0.01} placeholder="0.00" prefix="Bs"
              value={form.costoUnitario}
              onChange={(e) => updateField('costoUnitario', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <FormInput
              id="precioVenta" label="Precio de Venta (Bs)" required
              type="number" min={0.01} step={0.01} placeholder="0.00" prefix="Bs"
              value={form.precioVenta}
              onChange={(e) => updateField('precioVenta', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <FormInput
              id="stockMinimo" label="Stock Mínimo de Seguridad" required
              type="number" min={0} placeholder="Ej. 15"
              value={form.stockMinimo}
              onChange={(e) => updateField('stockMinimo', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <FormInput
              id="stockMaximo" label="Stock Máximo"
              type="number" min={0} placeholder="Ej. 200"
              value={form.stockMaximo}
              onChange={(e) => updateField('stockMaximo', e.target.value === '' ? '' : Number(e.target.value))}
            />
            <FormInput
              id="diasMinimosVenta" label="Días Mínimos de Venta"
              type="number" min={1} placeholder="Ej. 30"
              value={form.diasMinimosVenta}
              onChange={(e) => updateField('diasMinimosVenta', e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        </FormSection>

        {/* ── Sección 5: Estado del Producto ── */}
        <div className="pt-2 flex items-center justify-between bg-surface-container-low p-4 rounded-lg border border-surface-variant">
          <div>
            <h4 className="font-body-md text-body-md font-semibold text-on-surface">Estado del Producto</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Determina si el producto está disponible para la venta e ingreso de lotes.
            </p>
          </div>
          <label htmlFor="activoToggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                id="activoToggle" type="checkbox" className="sr-only peer"
                checked={form.activo}
                onChange={(e) => updateField('activo', e.target.checked)}
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </div>
            <span className="ml-3 font-label-md text-label-md text-on-surface">
              {form.activo ? 'Activo' : 'Inactivo'}
            </span>
          </label>
        </div>

        {/* ── Error de validación ── */}
        {submitError && (
          <div className="flex items-center gap-3 p-4 bg-error-container border border-error/30 rounded-lg">
            <span className="material-symbols-outlined text-[20px] text-error shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
            <p className="font-body-sm text-body-sm text-on-error-container">{submitError}</p>
          </div>
        )}

        {/* ── Acciones ── */}
        <div className="pt-8 mt-4 border-t border-outline-variant flex justify-end gap-4">
          <button
            type="button" onClick={handleCancel} disabled={isSubmitting}
            className="px-6 py-2 border border-primary text-primary bg-surface-container-lowest rounded-md font-label-md text-label-md hover:bg-surface-container transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit" disabled={isSubmitting || (!loadingProveedores && proveedores.length === 0)}
            className="px-6 py-2 bg-primary text-on-primary rounded-md font-label-md text-label-md hover:bg-primary/90 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Guardar Producto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoProductoForm;