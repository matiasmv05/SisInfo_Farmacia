// app/context/NuevoProductoContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { NuevoProductoForm, ProductoCreado } from '../types/Producto.types';
import { createProductoApi } from '../api/Producto.api';
import { asignarProveedorAProductoApi } from '../api/ProductoProveedor.api';

const FORM_INICIAL: NuevoProductoForm = {
  nombreComercial: '',
  categoria: '',
  laboratorio: '',
  concentracion: '',
  presentacion: '',
  costoUnitario: '',
  precioVenta: '',
  stockMinimo: '',
  stockMaximo: '',
  diasMinimosVenta: '',
  activo: true,
  proveedorId: '',       // ← nuevo campo
};

interface NuevoProductoContextType {
  form: NuevoProductoForm;
  isSubmitting: boolean;
  submitError: string | null;
  lastCreated: ProductoCreado | null;
  updateField: <K extends keyof NuevoProductoForm>(
    field: K,
    value: NuevoProductoForm[K]
  ) => void;
  resetForm: () => void;
  submitForm: () => Promise<boolean>;
}

const NuevoProductoContext = createContext<NuevoProductoContextType | undefined>(undefined);

export const NuevoProductoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [form, setForm] = useState<NuevoProductoForm>(FORM_INICIAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<ProductoCreado | null>(null);

  const updateField = useCallback(
    <K extends keyof NuevoProductoForm>(field: K, value: NuevoProductoForm[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (submitError) setSubmitError(null);
    },
    [submitError]
  );

  const resetForm = useCallback(() => {
    setForm(FORM_INICIAL);
    setSubmitError(null);
    setLastCreated(null);
  }, []);

  const submitForm = useCallback(async (): Promise<boolean> => {
    setSubmitError(null);

    // Validación
    if (
      !form.nombreComercial.trim() ||
      !form.categoria ||
      !form.laboratorio.trim() ||
      !form.presentacion.trim() ||
      form.costoUnitario === '' ||
      form.precioVenta === '' ||
      form.stockMinimo === ''
    ) {
      setSubmitError('Por favor complete todos los campos requeridos (*).');
      return false;
    }

    try {
      setIsSubmitting(true);

      // 1. Crear el producto
      const created = await createProductoApi({
        nombre: form.nombreComercial.trim(),
        categoria: form.categoria,
        laboratorio: form.laboratorio.trim(),
        concentracion: form.concentracion.trim(),
        presentacion: form.presentacion.trim(),
        precioCosto: Number(form.costoUnitario),
        precioVenta: Number(form.precioVenta),
        stockMinimo: Number(form.stockMinimo),
        ...(form.stockMaximo !== '' && { stockMaximo: Number(form.stockMaximo) }),
        ...(form.diasMinimosVenta !== '' && { diasMinimosVenta: Number(form.diasMinimosVenta) }),
        activo: form.activo,
      });

      // 2. Si seleccionó proveedor, asignar la relación producto-proveedor
      if (form.proveedorId !== '' && form.proveedorId !== undefined) {
        try {
          await asignarProveedorAProductoApi(
            created.id,
            Number(form.proveedorId),
            true   // esPrincipal = true porque es el primero
          );
        } catch (provErr) {
          // El producto ya se creó — no revertimos, solo avisamos
          console.warn('Producto creado pero falló la asignación del proveedor:', provErr);
        }
      }

      setLastCreated(created);
      return true;
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setSubmitError('Ocurrió un error al guardar el producto. Intente de nuevo.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  return (
    <NuevoProductoContext.Provider
      value={{ form, isSubmitting, submitError, lastCreated, updateField, resetForm, submitForm }}
    >
      {children}
    </NuevoProductoContext.Provider>
  );
};

export function useNuevoProducto() {
  const ctx = useContext(NuevoProductoContext);
  if (!ctx) throw new Error('useNuevoProducto debe usarse dentro de NuevoProductoProvider');
  return ctx;
}