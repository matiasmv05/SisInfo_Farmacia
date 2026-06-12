// app/components/NewProductModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useInventario } from "../context/InventarioContext";
import { ClaseAbc } from "../types/Inventario.types";

const CATEGORIAS = [
  "Analgésicos",
  "Antibióticos",
  "Cardiología",
  "Gástricos",
  "Suplementos",
  "Psicotrópicos",
];

interface FormState {
  nombre: string;
  categoria: string;
  laboratorio: string;
  stock: string;
  minimo: string;
  claseAbc: ClaseAbc;
  precio: string;
}

const EMPTY_FORM: FormState = {
  nombre: "",
  categoria: "",
  laboratorio: "",
  stock: "",
  minimo: "",
  claseAbc: "B",
  precio: "",
};

export const NewProductModal: React.FC = () => {
  const { isModalOpen, closeModal, createProduct, creating } = useInventario();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // Resetear formulario al abrir
  useEffect(() => {
    if (isModalOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [isModalOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeModal]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.nombre.trim()) newErrors.nombre = "Requerido";
    if (!form.categoria) newErrors.categoria = "Requerido";
    if (!form.laboratorio.trim()) newErrors.laboratorio = "Requerido";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      newErrors.stock = "Número válido";
    if (!form.minimo || isNaN(Number(form.minimo)) || Number(form.minimo) < 0)
      newErrors.minimo = "Número válido";
    if (!form.precio || isNaN(Number(form.precio)) || Number(form.precio) <= 0)
      newErrors.precio = "Precio válido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await createProduct({
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      laboratorio: form.laboratorio.trim(),
      stock: Number(form.stock),
      minimo: Number(form.minimo),
      claseAbc: form.claseAbc as ClaseAbc,
      precio: Number(form.precio),
    });
  };

  if (!isModalOpen) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      {/* Backdrop semi-translúcido premium */}
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" />

      {/* Panel del modal */}
      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[fadeInScale_200ms_ease-out]">
        {/* Cabecera */}
        <div className="flex justify-between items-start p-6 border-b border-outline-variant">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Nuevo Producto
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Completa los campos para agregar al catálogo.
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-on-surface-variant hover:bg-surface-container p-1.5 rounded-full transition-colors -mr-1 -mt-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">
              NOMBRE DEL PRODUCTO <span className="text-status-critical">*</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="ej. Amoxicilina 500mg"
              className={`w-full px-3 py-2.5 border rounded bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 transition-all ${
                errors.nombre
                  ? "border-status-critical focus:border-status-critical focus:ring-status-critical/30"
                  : "border-outline-variant focus:border-primary focus:ring-primary/30"
              }`}
            />
            {errors.nombre && (
              <p className="text-status-critical font-label-sm text-label-sm mt-1">
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Categoría + Laboratorio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">
                CATEGORÍA <span className="text-status-critical">*</span>
              </label>
              <div className="relative">
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className={`appearance-none w-full px-3 py-2.5 pr-8 border rounded bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                    errors.categoria
                      ? "border-status-critical focus:border-status-critical focus:ring-status-critical/30"
                      : "border-outline-variant focus:border-primary focus:ring-primary/30"
                  }`}
                >
                  <option value="">Seleccionar</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
              {errors.categoria && (
                <p className="text-status-critical font-label-sm text-label-sm mt-1">
                  {errors.categoria}
                </p>
              )}
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">
                LABORATORIO <span className="text-status-critical">*</span>
              </label>
              <input
                name="laboratorio"
                value={form.laboratorio}
                onChange={handleChange}
                placeholder="ej. Bayer"
                className={`w-full px-3 py-2.5 border rounded bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 transition-all ${
                  errors.laboratorio
                    ? "border-status-critical focus:border-status-critical focus:ring-status-critical/30"
                    : "border-outline-variant focus:border-primary focus:ring-primary/30"
                }`}
              />
              {errors.laboratorio && (
                <p className="text-status-critical font-label-sm text-label-sm mt-1">
                  {errors.laboratorio}
                </p>
              )}
            </div>
          </div>

          {/* Stock + Mínimo + Clase ABC */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">
                STOCK <span className="text-status-critical">*</span>
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-3 py-2.5 border rounded bg-surface-container-low font-data-mono text-data-mono text-on-surface focus:outline-none focus:ring-1 transition-all ${
                  errors.stock
                    ? "border-status-critical focus:border-status-critical focus:ring-status-critical/30"
                    : "border-outline-variant focus:border-primary focus:ring-primary/30"
                }`}
              />
              {errors.stock && (
                <p className="text-status-critical font-label-sm text-label-sm mt-1">
                  {errors.stock}
                </p>
              )}
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">
                MÍNIMO <span className="text-status-critical">*</span>
              </label>
              <input
                name="minimo"
                type="number"
                min="0"
                value={form.minimo}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-3 py-2.5 border rounded bg-surface-container-low font-data-mono text-data-mono text-on-surface focus:outline-none focus:ring-1 transition-all ${
                  errors.minimo
                    ? "border-status-critical focus:border-status-critical focus:ring-status-critical/30"
                    : "border-outline-variant focus:border-primary focus:ring-primary/30"
                }`}
              />
              {errors.minimo && (
                <p className="text-status-critical font-label-sm text-label-sm mt-1">
                  {errors.minimo}
                </p>
              )}
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">
                CLASE ABC
              </label>
              <div className="relative">
                <select
                  name="claseAbc"
                  value={form.claseAbc}
                  onChange={handleChange}
                  className="appearance-none w-full px-3 py-2.5 pr-8 border border-outline-variant rounded bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Precio */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">
              PRECIO (USD) <span className="text-status-critical">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md text-body-md">
                $
              </span>
              <input
                name="precio"
                type="number"
                step="0.01"
                min="0"
                value={form.precio}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2.5 border rounded bg-surface-container-low font-data-mono text-data-mono text-on-surface focus:outline-none focus:ring-1 transition-all ${
                  errors.precio
                    ? "border-status-critical focus:border-status-critical focus:ring-status-critical/30"
                    : "border-outline-variant focus:border-primary focus:ring-primary/30"
                }`}
              />
            </div>
            {errors.precio && (
              <p className="text-status-critical font-label-sm text-label-sm mt-1">
                {errors.precio}
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant mt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2 border border-outline-variant rounded font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-primary text-on-primary px-5 py-2 rounded font-label-md text-label-md shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {creating ? (
                <>
                  <span className="h-4 w-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                  Guardar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProductModal;
