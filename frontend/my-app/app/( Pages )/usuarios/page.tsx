'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { UsuarioProvider, useUsuarioContext } from '../../context/UsuarioContext';
import UsuarioCreateModal from '../../components/Usuario/UsuarioCreateModal';
import UsuarioEditModal from '../../components/Usuario/UsuarioEditModal';
import { UsuarioResponse } from '../../types/Usuario.types';

// Avatar mapping for UI (fallback image for demonstration)
const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuBcPgUuFVM9M_ratfZfZ7sMLFV9jnYNW_5VbuJ-OzHSHbAhzsb58Nnhx6UJsQP-a4arnSNkRKuspVUBepQv8kovsm0JtKp7g3UFmOBAZvcegih7oneoanFvHiqOL9_31tHTK5On6Qoz2B4Jb9PNpvzwvmgWFpInla5g-wMIaRiDZe8XYQKX2Ud9q4zByXsHhn-vNPYrydZMYr02HonYc47wgRX9gzPqisliKdprlRtlPfJ8H1k9vo6s6mxFYkhn6fhKAa0inLnPAJU";

function UsuariosPageContent() {
  const {
    state,
    cargarUsuarios,
    setBusqueda,
    setFiltroRol,
    setFiltroActivo,
    setEditando,
    setCreando,
    desactivarUsuario,
    activarUsuario
  } = useUsuarioContext();

  const { usuarios, loading, error, busqueda, filtroRol, filtroActivo, editando, creando } = state;

  const [inputBusqueda, setInputBusqueda] = useState(busqueda);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusqueda(inputBusqueda);
    }, 400);
    return () => clearTimeout(handler);
  }, [inputBusqueda, setBusqueda]);

  const handleToggleEstado = async (u: UsuarioResponse) => {
    if (u.activo) {
      const confirmado = confirm(`¿Estás seguro de que quieres desactivar a ${u.nombreCompleto}?`);
      if (!confirmado) return;
      try {
        await desactivarUsuario(u.id);
        alert("Usuario desactivado correctamente.");
      } catch (e) {
        alert("Error al desactivar el usuario.");
      }
    } else {
      const confirmado = confirm(`¿Estás seguro de que quieres activar a ${u.nombreCompleto}?`);
      if (!confirmado) return;
      try {
        await activarUsuario(u.id);
        alert("Usuario activado correctamente.");
      } catch (e) {
        alert("Error al activar el usuario.");
      }
    }
  };
  // Local filtering based on state
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      // Búsqueda
      const q = busqueda.toLowerCase();
      const matchBusqueda = u.nombreCompleto.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      
      // Filtro Rol
      const matchRol = filtroRol ? u.rol === filtroRol : true;
      
      // Filtro Activo
      const matchActivo = filtroActivo !== null ? u.activo === filtroActivo : true;

      return matchBusqueda && matchRol && matchActivo;
    });
  }, [usuarios, busqueda, filtroRol, filtroActivo]);

  // Paginación local 
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE));
  
  const usuariosPaginados = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return usuariosFiltrados.slice(start, start + ITEMS_PER_PAGE);
  }, [usuariosFiltrados, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter changes
  }, [busqueda, filtroRol, filtroActivo]);

  return (
    <>
      {creando && <UsuarioCreateModal onClose={() => setCreando(false)} />}
      {editando && <UsuarioEditModal usuario={editando} onClose={() => setEditando(null)} />}

      <div className="flex-1 flex flex-col min-h-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface">Gestión de Usuarios</h2>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1">
              Administre las cuentas del personal, roles y permisos de acceso al sistema.
            </p>
          </div>
          <button 
            onClick={() => setCreando(true)}
            className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2.5 rounded hover:bg-primary-container transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Crear Usuario
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded bg-surface-container-lowest text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline" 
              placeholder="Buscar por nombre o correo..." 
              type="text"
              value={inputBusqueda}
              onChange={(e) => setInputBusqueda(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={filtroRol ?? ""}
              onChange={(e) => setFiltroRol(e.target.value ? (e.target.value as any) : null)}
              className="w-full md:w-auto border border-outline-variant rounded bg-surface-container-lowest px-4 py-2 text-body-md focus:outline-none focus:border-primary"
            >
              <option value="">Rol (Todos)</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="OPERADOR">Operador</option>
            </select>
            <select 
              value={filtroActivo === null ? "" : filtroActivo.toString()}
              onChange={(e) => setFiltroActivo(e.target.value === "" ? null : e.target.value === "true")}
              className="w-full md:w-auto border border-outline-variant rounded bg-surface-container-lowest px-4 py-2 text-body-md focus:outline-none focus:border-primary"
            >
              <option value="">Estado (Todos)</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
            <button onClick={cargarUsuarios} className="ml-auto underline hover:no-underline font-medium">Reintentar</button>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm flex flex-col flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface border-b border-outline-variant h-10">
                  <th className="font-label-md text-label-md text-on-surface-variant px-4 uppercase">Usuario</th>
                  <th className="font-label-md text-label-md text-on-surface-variant px-4 uppercase">Correo Electrónico</th>
                  <th className="font-label-md text-label-md text-on-surface-variant px-4 uppercase">Rol</th>
                  <th className="font-label-md text-label-md text-on-surface-variant px-4 uppercase">Estado</th>
                  <th className="font-label-md text-label-md text-on-surface-variant px-4 text-right uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
                    </td>
                  </tr>
                )}

                {!loading && usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant font-body-sm text-body-sm">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}

                {!loading && usuariosPaginados.map(u => (
                  <tr key={u.id} className="hover:bg-[#F0F7FF] transition-colors h-[56px] group">
                    <td className="px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-10 rounded-full absolute left-0 hidden group-hover:block ${u.activo ? 'bg-secondary' : 'bg-error'}`}></div>
                        <div>
                          <p className={`font-body-md font-medium ${u.activo ? 'text-on-surface' : 'text-on-surface/70'}`}>
                            {u.nombreCompleto}
                          </p>
                          <p className={`font-body-sm ${u.activo ? 'text-on-surface-variant' : 'text-on-surface-variant/70'}`}>
                            {u.telefono || 'Sin teléfono'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 font-body-md ${u.activo ? 'text-on-surface-variant' : 'text-on-surface-variant/70'}`}>
                      {u.email}
                    </td>
                    <td className={`px-4 ${!u.activo ? 'opacity-70' : ''}`}>
                      <span className={`inline-flex items-center px-2 py-1 rounded font-label-md text-label-sm border ${
                        u.rol === 'ADMINISTRADOR'
                          ? 'bg-primary-container/10 text-primary border-primary/20'
                          : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'
                      }`}>
                        {u.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Operador'}
                      </span>
                    </td>
                    <td className="px-4">
                      {u.activo ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-secondary-container/20 text-on-secondary-container font-label-md text-label-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-error/10 text-error font-label-md text-label-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditando(u)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors" 
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleToggleEstado(u)}
                          className={`p-1.5 rounded transition-colors ${
                            u.activo 
                              ? 'text-on-surface-variant hover:text-error hover:bg-error/10' 
                              : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/10'
                          }`}
                          title={u.activo ? "Desactivar" : "No se puede reactivar"}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {u.activo ? 'delete' : 'lock'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-surface border-t border-outline-variant px-4 py-3 flex items-center justify-between mt-auto">
            <span className="font-body-sm text-on-surface-variant">
              Mostrando {usuariosFiltrados.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, usuariosFiltrados.length)} de {usuariosFiltrados.length} usuarios
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 text-on-surface-variant hover:text-primary transition-colors disabled:text-outline disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPaginas, p + 1))}
                disabled={currentPage === totalPaginas || totalPaginas === 0}
                className="p-1 text-on-surface-variant hover:text-primary transition-colors disabled:text-outline disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UsuariosPage() {
  return (
    <UsuarioProvider>
      <UsuariosPageContent />
    </UsuarioProvider>
  );
}
