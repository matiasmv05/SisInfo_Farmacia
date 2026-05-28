// app/api/Usuario.api.ts

import { PaginatedResponse } from '../types/Inventario.types';
import {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  UsuarioResponse,
} from '../types/Usuario.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined'
      ? (sessionStorage.getItem('farmacia_token') ?? localStorage.getItem('farmacia_token'))
      : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET /api/usuarios — lista activos sin paginación
export async function fetchUsuariosActivosApi(): Promise<UsuarioResponse[]> {
  const res = await fetch(`${BASE_URL}/api/usuarios`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// GET /api/usuarios/todos — lista todos (activos e inactivos) para gestión
export async function fetchUsuariosTodosApi(): Promise<UsuarioResponse[]> {
  const res = await fetch(`${BASE_URL}/api/usuarios/todos`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// GET /api/usuarios/paginado?page=0&limit=20
export async function fetchUsuariosPaginadoApi(params: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<UsuarioResponse>> {
  const { page = 0, limit = 20 } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const res = await fetch(`${BASE_URL}/api/usuarios/paginado?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// GET /api/usuarios/{id}
export async function fetchUsuarioByIdApi(id: number): Promise<UsuarioResponse> {
  const res = await fetch(`${BASE_URL}/api/usuarios/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// POST /api/usuarios
export async function crearUsuarioApi(dto: CrearUsuarioRequest): Promise<UsuarioResponse> {
  const res = await fetch(`${BASE_URL}/api/usuarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}

// PUT /api/usuarios/{id}
export async function actualizarUsuarioApi(
  id: number,
  dto: ActualizarUsuarioRequest
): Promise<UsuarioResponse> {
  const res = await fetch(`${BASE_URL}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}

// PUT /api/usuarios/eliminar/{id} — desactiva el usuario (soft-delete)
export async function desactivarUsuarioApi(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/usuarios/eliminar/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}

// PUT /api/usuarios/activar/{id} — activa el usuario
export async function activarUsuarioApi(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/usuarios/activar/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}
