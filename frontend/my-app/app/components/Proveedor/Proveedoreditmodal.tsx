'use client';
// app/(Pages)/proveedores/ProveedorEditModal.tsx

import { useEffect, useState } from 'react';

import { useProveedorContext } from '../../context/Proveedorcontext';
import { ProveedorForm, ProveedorResponse } from '../../types/Proveedor.types';

interface Props {
  proveedor: ProveedorResponse;
  onClose: () => void;
}

export default function ProveedorEditModal({ proveedor, onClose }: Props) {
  const { actualizarProveedor } = useProveedorContext();
  const [form, setForm] = useState<ProveedorForm>({
    nombre: proveedor.nombre,
    contactoNombre: proveedor.contactoNombre ?? '',
    telefono: proveedor.telefono ?? '',
    correo: proveedor.correo ?? '',
    direccion: proveedor.direccion ?? '',
    activo: proveedor.activo,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await actualizarProveedor(proveedor.id, {
        nombre: form.nombre.trim(),
        contactoNombre: form.contactoNombre.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        correo: form.correo.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Editar Proveedor</h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Nombre o Razón Social <span className="text-error">*</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              maxLength={150}
              className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Contacto Principal
            </label>
            <input
              name="contactoNombre"
              value={form.contactoNombre}
              onChange={handleChange}
              maxLength={100}
              className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Teléfono
              </label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                maxLength={30}
                className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Correo
              </label>
              <input
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                maxLength={100}
                className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Dirección
            </label>
            <textarea
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              maxLength={250}
              rows={2}
              className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-primary text-primary font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}