'use client';
// app/context/UsuarioContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from 'react';

import {
  actualizarUsuarioApi,
  crearUsuarioApi,
  desactivarUsuarioApi,
  activarUsuarioApi,
  fetchUsuariosTodosApi,
} from '../api/Usuario.api';
import {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  UsuarioResponse,
} from '../types/Usuario.types';

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
interface UsuarioState {
  usuarios: UsuarioResponse[];
  busqueda: string;
  filtroRol: 'ADMINISTRADOR' | 'OPERADOR' | null;
  filtroActivo: boolean | null; // null = todos
  loading: boolean;
  error: string | null;
  // Modales
  editando: UsuarioResponse | null;
  creando: boolean;
}

const initialState: UsuarioState = {
  usuarios: [],
  busqueda: '',
  filtroRol: null,
  filtroActivo: null,
  loading: false,
  error: null,
  editando: null,
  creando: false,
};

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: UsuarioResponse[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_BUSQUEDA'; payload: string }
  | { type: 'SET_FILTRO_ROL'; payload: 'ADMINISTRADOR' | 'OPERADOR' | null }
  | { type: 'SET_FILTRO_ACTIVO'; payload: boolean | null }
  | { type: 'SET_EDITANDO'; payload: UsuarioResponse | null }
  | { type: 'SET_CREANDO'; payload: boolean }
  | { type: 'ADD_USUARIO'; payload: UsuarioResponse }
  | { type: 'UPDATE_USUARIO'; payload: UsuarioResponse }
  | { type: 'REMOVE_USUARIO'; payload: number }
  | { type: 'ACTIVATE_USUARIO'; payload: number };


function reducer(state: UsuarioState, action: Action): UsuarioState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, usuarios: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_BUSQUEDA':
      return { ...state, busqueda: action.payload };
    case 'SET_FILTRO_ROL':
      return { ...state, filtroRol: action.payload };
    case 'SET_FILTRO_ACTIVO':
      return { ...state, filtroActivo: action.payload };
    case 'SET_EDITANDO':
      return { ...state, editando: action.payload };
    case 'SET_CREANDO':
      return { ...state, creando: action.payload };
    case 'ADD_USUARIO':
      return {
        ...state,
        usuarios: [action.payload, ...state.usuarios],
        creando: false,
      };
    case 'UPDATE_USUARIO':
      return {
        ...state,
        usuarios: state.usuarios.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
        editando: null,
      };
    case 'REMOVE_USUARIO':
      return {
        ...state,
        usuarios: state.usuarios.map((u) =>
          u.id === action.payload ? { ...u, activo: false } : u
        ),
      };
    case 'ACTIVATE_USUARIO':
      return {
        ...state,
        usuarios: state.usuarios.map((u) =>
          u.id === action.payload ? { ...u, activo: true } : u
        ),
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface UsuarioContextValue {
  state: UsuarioState;
  cargarUsuarios: () => Promise<void>;
  setBusqueda: (v: string) => void;
  setFiltroRol: (v: 'ADMINISTRADOR' | 'OPERADOR' | null) => void;
  setFiltroActivo: (v: boolean | null) => void;
  crearUsuario: (dto: CrearUsuarioRequest) => Promise<UsuarioResponse>;
  actualizarUsuario: (id: number, dto: ActualizarUsuarioRequest) => Promise<UsuarioResponse>;
  desactivarUsuario: (id: number) => Promise<void>;
  activarUsuario: (id: number) => Promise<void>;
  setEditando: (u: UsuarioResponse | null) => void;
  setCreando: (v: boolean) => void;
}

const UsuarioContext = createContext<UsuarioContextValue | null>(null);

export function UsuarioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const cargarUsuarios = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await fetchUsuariosTodosApi();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', payload: (e as Error).message });
    }
  }, []);

  const setBusqueda = useCallback((v: string) => {
    dispatch({ type: 'SET_BUSQUEDA', payload: v });
  }, []);

  const setFiltroRol = useCallback((v: 'ADMINISTRADOR' | 'OPERADOR' | null) => {
    dispatch({ type: 'SET_FILTRO_ROL', payload: v });
  }, []);

  const setFiltroActivo = useCallback((v: boolean | null) => {
    dispatch({ type: 'SET_FILTRO_ACTIVO', payload: v });
  }, []);

  const setEditando = useCallback((u: UsuarioResponse | null) => {
    dispatch({ type: 'SET_EDITANDO', payload: u });
  }, []);

  const setCreando = useCallback((v: boolean) => {
    dispatch({ type: 'SET_CREANDO', payload: v });
  }, []);

  const crearUsuario = useCallback(async (dto: CrearUsuarioRequest) => {
    const nuevo = await crearUsuarioApi(dto);
    dispatch({ type: 'ADD_USUARIO', payload: nuevo });
    return nuevo;
  }, []);

  const actualizarUsuario = useCallback(
    async (id: number, dto: ActualizarUsuarioRequest) => {
      const actualizado = await actualizarUsuarioApi(id, dto);
      dispatch({ type: 'UPDATE_USUARIO', payload: actualizado });
      return actualizado;
    },
    []
  );

  const desactivarUsuario = useCallback(async (id: number) => {
    await desactivarUsuarioApi(id);
    dispatch({ type: 'REMOVE_USUARIO', payload: id });
  }, []);


  const activarUsuario = useCallback(async (id: number) => {
    await activarUsuarioApi(id);
    dispatch({ type: 'ACTIVATE_USUARIO', payload: id });
  }, []);

  return (
    <UsuarioContext.Provider
      value={{
        state,
        cargarUsuarios,
        setBusqueda,
        setFiltroRol,
        setFiltroActivo,
        crearUsuario,
        actualizarUsuario,
        desactivarUsuario,
        setEditando,
        setCreando,
        activarUsuario,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuarioContext() {
  const ctx = useContext(UsuarioContext);
  if (!ctx) throw new Error('useUsuarioContext must be used inside UsuarioProvider');
  return ctx;
}
