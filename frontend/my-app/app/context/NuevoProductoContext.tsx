// app/context/NuevoProductoContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import { NuevoProductoForm, ProductoCreado } from '../types/Producto.types';
import { createProductoApi } from '../api/Producto.api';

// ————— Estado inicial del formulario —————
const FORM_INICIAL: NuevoProductoForm = {
  nombreComercial: '',
  categoria: '',
  laboratorio: '',
  concentracion: '',
  presentacion: '',
  costoUnitario: '',
  precioVenta: '',
  stockMinimo: '',
  activo: true,
};

// ————— Tipo del contexto —————
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

const NuevoProductoContext = createContext<NuevoProductoContextType | undefined>(
  undefined
);

// ————— Provider —————
export const NuevoProductoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [form, setForm] = useState<NuevoProductoForm>(FORM_INICIAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<ProductoCreado | null>(null);

  const updateField = useCallback(
    <K extends keyof NuevoProductoForm>(field: K, value: NuevoProductoForm[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Limpiar error al empezar a corregir
      if (submitError) setSubmitError(null);
    },
    [submitError]
  );

  const resetForm = useCallback(() => {
    setForm(FORM_INICIAL);
    setSubmitError(null);
    setLastCreated(null);
  }, []);

  /**
   * Envía el formulario al API.
   * Retorna true si fue exitoso, false si hubo error.
   */
  const submitForm = useCallback(async (): Promise<boolean> => {
    setSubmitError(null);

    // Validación básica de campos requeridos
    if (
      !form.nombreComercial.trim() ||
      !form.categoria ||
      !form.laboratorio.trim() ||
      !form.presentacion ||
      form.costoUnitario === '' ||
      form.precioVenta === '' ||
      form.stockMinimo === ''
    ) {
      setSubmitError('Por favor complete todos los campos requeridos (*).');
      return false;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        nombreComercial: form.nombreComercial.trim(),
        categoria: form.categoria,
        laboratorio: form.laboratorio.trim(),
        concentracion: form.concentracion.trim(),
        presentacion: form.presentacion,
        costoUnitario: Number(form.costoUnitario),
        precioVenta: Number(form.precioVenta),
        stockMinimo: Number(form.stockMinimo),
        activo: form.activo,
      };
      const created = await createProductoApi(payload);
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
      value={{
        form,
        isSubmitting,
        submitError,
        lastCreated,
        updateField,
        resetForm,
        submitForm,
      }}
    >
      {children}
    </NuevoProductoContext.Provider>
  );
};

export function useNuevoProducto() {
  const ctx = useContext(NuevoProductoContext);
  if (!ctx) {
    throw new Error(
      'useNuevoProducto debe usarse dentro de NuevoProductoProvider'
    );
  }
  return ctx;
}
