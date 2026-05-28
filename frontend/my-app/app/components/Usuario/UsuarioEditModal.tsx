'use client';
// app/components/Usuario/UsuarioEditModal.tsx

import { useEffect, useState } from 'react';
import { useUsuarioContext } from '../../context/UsuarioContext';
import { UsuarioResponse } from '../../types/Usuario.types';

interface Props {
  usuario: UsuarioResponse;
  onClose: () => void;
}

interface EditForm {
  nombreCompleto: string;
  email: string;
  telefono: string;
  password: string;
  confirmarPassword: string;
}

export default function UsuarioEditModal({ usuario, onClose }: Props) {
  const { actualizarUsuario } = useUsuarioContext();
  const [form, setForm] = useState<EditForm>({
    nombreCompleto: usuario.nombreCompleto,
    email: usuario.email,
    telefono: usuario.telefono ?? '',
    password: '',
    confirmarPassword: '',
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nombreCompleto.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }
    if (!form.email.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (form.password && form.password !== form.confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setGuardando(true);
    try {
      await actualizarUsuario(usuario.id, {
        nombreCompleto: form.nombreCompleto.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
        passwordHash: form.password || undefined,
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
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Editar Usuario</h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container"
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

          {/* Info del usuario */}
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <p className="font-body-md text-on-surface font-medium">{usuario.nombreCompleto}</p>
              <p className="font-body-sm text-on-surface-variant">{usuario.email}</p>
            </div>
            <span className={`ml-auto inline-flex items-center px-2 py-1 rounded font-label-md text-label-sm border ${
              usuario.rol === 'ADMINISTRADOR'
                ? 'bg-primary-container/10 text-primary border-primary/20'
                : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'
            }`}>
              {usuario.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Operador'}
            </span>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Nombre Completo <span className="text-error">*</span>
            </label>
            <input
              name="nombreCompleto"
              value={form.nombreCompleto}
              onChange={handleChange}
              required
              maxLength={150}
              className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Correo Electrónico <span className="text-error">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
              />
            </div>
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
          </div>

          {/* Cambio de contraseña (opcional) */}
          <div className="border-t border-outline-variant pt-4">
            <p className="font-label-md text-label-md text-on-surface-variant mb-3">
              Cambiar Contraseña <span className="text-outline">(dejar vacío para no cambiar)</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Nueva Contraseña
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Confirmar
                </label>
                <input
                  name="confirmarPassword"
                  type="password"
                  value={form.confirmarPassword}
                  onChange={handleChange}
                  minLength={6}
                  placeholder="Repetir contraseña"
                  className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                />
              </div>
            </div>
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
