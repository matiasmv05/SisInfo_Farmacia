// app/api/Proveedor.api.ts

import { PaginatedResponse } from '../types/Inventario.types';
import { ProveedorRequest, ProveedorResponse } from '../types/Proveedor.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("farmacia_token") ?? localStorage.getItem("farmacia_token"))
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET /api/proveedores/todos — lista activos sin paginación (para dropdowns)
export async function fetchProveedoresActivosApi(): Promise<ProveedorResponse[]> {
  const res = await fetch(`${BASE_URL}/api/proveedores/todos`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// GET /api/proveedores?page=0&limit=20&nombre=...&activo=...
export async function fetchProveedoresPaginadoApi(params: {
  page?: number;
  limit?: number;
  nombre?: string;
  activo?: boolean | null;
}): Promise<PaginatedResponse<ProveedorResponse>> {
  const { page = 0, limit = 20, nombre, activo } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (nombre) query.set('nombre', nombre);
  if (activo !== null && activo !== undefined) query.set('activo', String(activo));

  const res = await fetch(`${BASE_URL}/api/proveedores?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// GET /api/proveedores/{id}
export async function fetchProveedorByIdApi(id: number): Promise<ProveedorResponse> {
  const res = await fetch(`${BASE_URL}/api/proveedores/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// POST /api/proveedores
export async function crearProveedorApi(dto: ProveedorRequest): Promise<ProveedorResponse> {
  const res = await fetch(`${BASE_URL}/api/proveedores`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// PUT /api/proveedores/{id}
export async function actualizarProveedorApi(
  id: number,
  dto: ProveedorRequest
): Promise<ProveedorResponse> {
  const res = await fetch(`${BASE_URL}/api/proveedores/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// DELETE /api/proveedores/{id} — desactiva el proveedor
export async function desactivarProveedorApi(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/proveedores/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}

// PATCH /api/proveedores/{id}/activar
export async function activarProveedorApi(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/proveedores/${id}/activar`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}