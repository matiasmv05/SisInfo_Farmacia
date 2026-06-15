'use client';

import { useState } from 'react';
import { useAuth } from '../../context/Authcontext';
import { actualizarUsuarioApi } from '../../api/Usuario.api';
import { UsuarioResponse } from '../../types/Usuario.types';

// ── Modal de perfil propio ────────────────────────────────────────────────────
interface EditForm {
  nombreCompleto: string;
  email: string;
  telefono: string;
  password: string;
  confirmarPassword: string;
}

function PerfilModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();

  const [form, setForm] = useState<EditForm>({
    nombreCompleto: user?.nombreCompleto ?? '',
    email:          user?.username ?? '',   // username en el token es el email
    telefono:       '',
    password:       '',
    confirmarPassword: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [exito,     setExito]     = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nombreCompleto.trim()) { setError('El nombre completo es obligatorio.'); return; }
    if (!form.email.trim())          { setError('El correo es obligatorio.');           return; }
    if (form.password && form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.'); return;
    }
    if (form.password && form.password !== form.confirmarPassword) {
      setError('Las contraseñas no coinciden.'); return;
    }
    if (!user?.id) { setError('No se pudo identificar el usuario.'); return; }

    setGuardando(true);
    try {
      await actualizarUsuarioApi(user.id, {
        nombreCompleto: form.nombreCompleto.trim(),
        email:          form.email.trim(),
        telefono:       form.telefono.trim() || undefined,
        passwordHash:   form.password || undefined,
      });
      setExito(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError((err as Error).message ?? 'Error al guardar.');
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
            <span className="material-symbols-outlined text-primary">manage_accounts</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Mi Perfil</h3>
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

          {/* Info de rol — solo lectura */}
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <p className="font-body-md text-on-surface font-medium">{user?.nombreCompleto}</p>
              <p className="font-body-sm text-on-surface-variant">{user?.username}</p>
            </div>
            <span className={`ml-auto inline-flex items-center px-2 py-1 rounded font-label-md text-label-sm border ${
              user?.rol === 'ADMINISTRADOR'
                ? 'bg-primary-container/10 text-primary border-primary/20'
                : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'
            }`}>
              {user?.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Operador'}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {exito && (
            <div className="p-3 rounded bg-secondary-container/20 text-on-secondary-container font-body-sm text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Perfil actualizado correctamente.
            </div>
          )}

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Nombre Completo <span className="text-error">*</span>
            </label>
            <input
              name="nombreCompleto"
              value={form.nombreCompleto}
              onChange={handleChange}
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
                placeholder="Opcional"
                className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
              />
            </div>
          </div>

          {/* Cambio de contraseña opcional */}
          <div className="border-t border-outline-variant pt-4">
            <p className="font-label-md text-label-md text-on-surface-variant mb-3">
              Cambiar Contraseña{' '}
              <span className="text-outline">(dejar vacío para no cambiar)</span>
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
              disabled={guardando || exito}
              className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {guardando ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  Guardando…
                </>
              ) : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── TopAppBar ─────────────────────────────────────────────────────────────────
export default function TopAppBar() {
  const { user } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <>
      {modalAbierto && <PerfilModal onClose={() => setModalAbierto(false)} />}

      <header className="bg-surface h-row_height_standard px-gutter border-b border-outline-variant flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
            Inventario Farmacéutico
          </h2>
        </div>

        {/* Perfil del usuario */}
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors group"
          title="Editar mi perfil"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[18px]">person</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-label-md text-label-md text-on-surface leading-tight">
              {user?.nombreCompleto ?? 'Usuario'}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
              {user?.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Operador'}
            </p>
          </div>
        </button>
      </header>
    </>
  );
}