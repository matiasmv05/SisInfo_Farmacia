// app/api/Producto.api.ts
import {
  NuevoProductoPayload,
  ProductoCreado,
} from '../types/Producto.types';


import { ProductoDetalle, ProductoRequest, PaginatedResponse, CategoriaProducto } from '../types/Inventario.types';

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

// GET /api/productos?page=0&limit=20&nombre=...&categoria=...
export interface FetchProductosParams {
  page?: number;
  limit?: number;
  nombre?: string;
  categoria?: string;
  clasificacionAbc?: string;
}

export async function fetchProductosApi(params: FetchProductosParams): Promise<PaginatedResponse<ProductoDetalle>> {
  const query = new URLSearchParams();
  query.set('page',  String(params.page  ?? 0));
  query.set('limit', String(params.limit ?? 20));
  if (params.nombre) query.append("nombre", params.nombre);
  if (params.categoria) query.append("categoria", params.categoria);
  if (params.clasificacionAbc) query.append("clasificacionAbc", params.clasificacionAbc);
 
  const res = await fetch(`${BASE_URL}/api/productos?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// GET /api/productos/stock-critico
export async function fetchStockCriticoApi(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<ProductoDetalle>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const res = await fetch(`${BASE_URL}/api/productos/stock-critico?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// POST /api/productos  ← aquí estaba el tipo incorrecto
export async function createProductoApi(payload: ProductoRequest): Promise<ProductoDetalle> {
  const res = await fetch(`${BASE_URL}/api/productos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// PUT /api/productos/:id

export async function updateProductoApi(id: number, payload: ProductoRequest): Promise<ProductoDetalle> {
  const res = await fetch(`${BASE_URL}/api/productos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// DELETE /api/productos/:id
export async function deleteProductoApi(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/productos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}

/** PATCH /api/productos/{id} — reactiva un producto desactivado */
export async function activarProductoApi(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/productos/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error al activar producto (${res.status})`);
}


// Tipo liviano solo para el combobox de ProductoMultiSelect

export interface ProductoResumen {
  id: number;
  nombre: string;
  laboratorio: string;
  presentacion: string;
}

// Busca productos por nombre — usa el endpoint paginado existente
// GET /api/productos?page=0&limit=10&nombre=...
export async function buscarProductosApi(nombre: string): Promise<ProductoResumen[]> {
  const body = await fetchProductosApi({ page: 0, limit: 10, nombre });
  return (body.data as ProductoResumen[]).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    laboratorio: p.laboratorio,
    presentacion: p.presentacion,
  }));
}

// GET /api/productos/{productoId}/proveedores
export interface ProductoProveedorDetalle {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  codigoProductoProveedor: string;
  costo: number;
  esPrincipal: boolean;
}

export async function fetchProveedoresDelProductoApi(productoId: number): Promise<ProductoProveedorDetalle[]> {
  const res = await fetch(`${BASE_URL}/api/productos/${productoId}/proveedores`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}
