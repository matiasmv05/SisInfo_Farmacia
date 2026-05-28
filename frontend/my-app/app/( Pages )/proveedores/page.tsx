'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ProveedorProvider, useProveedorContext } from '../../context/Proveedorcontext';
import { ProveedorResponse } from '../../types/Proveedor.types';
import ProveedorEditModal from '../../components/Proveedor/Proveedoreditmodal';

// ── Contenido separado para poder usar el context ──
function ProveedoresPageContent() {
  const {
    state,
    cargarProveedores,
    cambiarPagina,
    setBusqueda,
    setFiltroActivo,
    toggleActivo,
    setEditando,
  } = useProveedorContext();

  const { proveedores, total, page, limit, loading, error, busqueda, filtroActivo, editando } =
    state;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inputBusqueda, setInputBusqueda] = useState(busqueda);

  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores, page, busqueda, filtroActivo]);

  const handleBusquedaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputBusqueda(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setBusqueda(val), 400);
    },
    [setBusqueda]
  );

  const totalPaginas = Math.max(1, Math.ceil(total / limit));

  const handleToggleActivo = async (p: ProveedorResponse) => {
    try {
      await toggleActivo(p);
    } catch {
      alert('No se pudo cambiar el estado del proveedor. Intente de nuevo.');
    }
  };

  return (
    <>
      {editando && <ProveedorEditModal proveedor={editando} onClose={() => setEditando(null)} />}

      <div className="flex-1 flex flex-col h-full min-h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Gestión de Proveedores
          </h2>
          <Link href="/proveedores/crear">
            <button className="bg-primary text-on-primary px-4 py-2 rounded font-label-md text-label-md flex items-center gap-2 hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nuevo Proveedor
            </button>
          </Link>
        </div>

        {/* Surface Container */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex-1 flex flex-col shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-outline-variant flex gap-4 items-center bg-surface-bright rounded-t-lg flex-wrap">
            <div className="relative w-80 max-w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline"
                placeholder="Buscar por nombre..."
                type="text"
                value={inputBusqueda}
                onChange={handleBusquedaChange}
              />
            </div>

            <div className="flex-1" />

            <div className="flex gap-2">
              {(
                [
                  { label: 'Todos', value: null },
                  { label: 'Activos', value: true },
                  { label: 'Inactivos', value: false },
                ] as { label: string; value: boolean | null }[]
              ).map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setFiltroActivo(value)}
                  className={`px-3 py-1.5 rounded border font-label-sm text-label-sm transition-colors ${
                    filtroActivo === value
                      ? 'bg-primary text-on-primary border-primary'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-4 p-3 rounded bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
              <button onClick={cargarProveedores} className="ml-auto underline hover:no-underline">
                Reintentar
              </button>
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Proveedor</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Contacto</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Teléfono</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Correo</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Dirección</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold">Estado</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
                        progress_activity
                      </span>
                    </td>
                  </tr>
                )}

                {!loading && proveedores.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-on-surface-variant font-body-sm text-body-sm">
                      No se encontraron proveedores.
                    </td>
                  </tr>
                )}

                {!loading &&
                  proveedores.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface font-medium">{p.nombre}</td>
                      <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant">{p.contactoNombre ?? '—'}</td>
                      <td className="py-3 px-4 font-data-mono text-data-mono text-on-surface-variant">{p.telefono ?? '—'}</td>
                      <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant">{p.correo ?? '—'}</td>
                      <td className="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant">{p.direccion ?? '—'}</td>
                      <td className="py-3 px-4">
                        {p.activo ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setEditando(p)}
                          className="text-outline hover:text-primary transition-colors p-1"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleActivo(p)}
                          className="text-outline hover:text-primary transition-colors p-1"
                          title={p.activo ? 'Desactivar' : 'Activar'}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {p.activo ? 'toggle_on' : 'toggle_off'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-auto p-4 border-t border-outline-variant flex items-center justify-between bg-surface-bright rounded-b-lg flex-wrap gap-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {total === 0
                ? 'Sin resultados'
                : `Mostrando ${page * limit + 1}–${Math.min((page + 1) * limit, total)} de ${total} proveedores`}
            </span>
            <div className="flex gap-2 items-center">
              <button
                disabled={page === 0 || loading}
                onClick={() => cambiarPagina(page - 1)}
                className="px-3 py-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-50 font-label-sm text-label-sm"
              >
                Anterior
              </button>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Pág. {page + 1} / {totalPaginas}
              </span>
              <button
                disabled={page + 1 >= totalPaginas || loading}
                onClick={() => cambiarPagina(page + 1)}
                className="px-3 py-1 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-50 font-label-sm text-label-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Export default: Provider envuelve el contenido ──
export default function ProveedoresPage() {
  return (
    <ProveedorProvider>
      <ProveedoresPageContent />
    </ProveedorProvider>
  );
}