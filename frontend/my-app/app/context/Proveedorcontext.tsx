'use client';
// app/context/ProveedorContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from 'react';

import {
  activarProveedorApi,
  actualizarProveedorApi,
  crearProveedorApi,
  desactivarProveedorApi,
  fetchProveedoresPaginadoApi,
} from '../api/Proveedor.api';
import { PaginatedResponse } from '../types/Inventario.types';
import { ProveedorRequest, ProveedorResponse } from '../types/Proveedor.types';

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
interface ProveedorState {
  proveedores: ProveedorResponse[];
  total: number;
  page: number;
  limit: number;
  busqueda: string;
  filtroActivo: boolean | null; // null = todos
  loading: boolean;
  error: string | null;
  // Modal de edición
  editando: ProveedorResponse | null;
}

const initialState: ProveedorState = {
  proveedores: [],
  total: 0,
  page: 0,
  limit: 20,
  busqueda: '',
  filtroActivo: null,
  loading: false,
  error: null,
  editando: null,
};

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: PaginatedResponse<ProveedorResponse> }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_BUSQUEDA'; payload: string }
  | { type: 'SET_FILTRO_ACTIVO'; payload: boolean | null }
  | { type: 'SET_EDITANDO'; payload: ProveedorResponse | null }
  | { type: 'UPSERT_PROVEEDOR'; payload: ProveedorResponse }
  | { type: 'TOGGLE_ACTIVO_LOCAL'; payload: { id: number; activo: boolean } };

function reducer(state: ProveedorState, action: Action): ProveedorState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        proveedores: action.payload.data,
        total: action.payload.totalElements ?? 0,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_BUSQUEDA':
      return { ...state, busqueda: action.payload, page: 0 };
    case 'SET_FILTRO_ACTIVO':
      return { ...state, filtroActivo: action.payload, page: 0 };
    case 'SET_EDITANDO':
      return { ...state, editando: action.payload };
    case 'UPSERT_PROVEEDOR': {
      const existe = state.proveedores.some((p) => p.id === action.payload.id);
      return {
        ...state,
        proveedores: existe
          ? state.proveedores.map((p) =>
              p.id === action.payload.id ? action.payload : p
            )
          : [action.payload, ...state.proveedores],
        editando: null,
      };
    }
    case 'TOGGLE_ACTIVO_LOCAL':
      return {
        ...state,
        proveedores: state.proveedores.map((p) =>
          p.id === action.payload.id ? { ...p, activo: action.payload.activo } : p
        ),
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface ProveedorContextValue {
  state: ProveedorState;
  cargarProveedores: () => Promise<void>;
  cambiarPagina: (page: number) => void;
  setBusqueda: (v: string) => void;
  setFiltroActivo: (v: boolean | null) => void;
  crearProveedor: (dto: ProveedorRequest) => Promise<ProveedorResponse>;
  actualizarProveedor: (id: number, dto: ProveedorRequest) => Promise<ProveedorResponse>;
  toggleActivo: (proveedor: ProveedorResponse) => Promise<void>;
  setEditando: (p: ProveedorResponse | null) => void;
}

const ProveedorContext = createContext<ProveedorContextValue | null>(null);

export function ProveedorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Ref para acceder al estado actual dentro de callbacks sin stale closure
  const stateRef = useRef(state);
  stateRef.current = state;

  const cargarProveedores = useCallback(async () => {
    const { page, limit, busqueda, filtroActivo } = stateRef.current;
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await fetchProveedoresPaginadoApi({
        page,
        limit,
        nombre: busqueda || undefined,
        activo: filtroActivo ?? undefined,
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', payload: (e as Error).message });
    }
  }, []);

  const cambiarPagina = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setBusqueda = useCallback((v: string) => {
    dispatch({ type: 'SET_BUSQUEDA', payload: v });
  }, []);

  const setFiltroActivo = useCallback((v: boolean | null) => {
    dispatch({ type: 'SET_FILTRO_ACTIVO', payload: v });
  }, []);

  const setEditando = useCallback((p: ProveedorResponse | null) => {
    dispatch({ type: 'SET_EDITANDO', payload: p });
  }, []);

  const crearProveedor = useCallback(async (dto: ProveedorRequest) => {
    const nuevo = await crearProveedorApi(dto);
    dispatch({ type: 'UPSERT_PROVEEDOR', payload: nuevo });
    return nuevo;
  }, []);

  const actualizarProveedor = useCallback(
    async (id: number, dto: ProveedorRequest) => {
      const actualizado = await actualizarProveedorApi(id, dto);
      dispatch({ type: 'UPSERT_PROVEEDOR', payload: actualizado });
      return actualizado;
    },
    []
  );

  const toggleActivo = useCallback(async (proveedor: ProveedorResponse) => {
    // Optimistic update
    dispatch({
      type: 'TOGGLE_ACTIVO_LOCAL',
      payload: { id: proveedor.id, activo: !proveedor.activo },
    });
    try {
      if (proveedor.activo) {
        await desactivarProveedorApi(proveedor.id);
      } else {
        await activarProveedorApi(proveedor.id);
      }
    } catch (e) {
      // Revertir en caso de error
      dispatch({
        type: 'TOGGLE_ACTIVO_LOCAL',
        payload: { id: proveedor.id, activo: proveedor.activo },
      });
      throw e;
    }
  }, []);

  return (
    <ProveedorContext.Provider
      value={{
        state,
        cargarProveedores,
        cambiarPagina,
        setBusqueda,
        setFiltroActivo,
        crearProveedor,
        actualizarProveedor,
        toggleActivo,
        setEditando,
      }}
    >
      {children}
    </ProveedorContext.Provider>
  );
}

export function useProveedorContext() {
  const ctx = useContext(ProveedorContext);
  if (!ctx) throw new Error('useProveedorContext must be used inside ProveedorProvider');
  return ctx;
}