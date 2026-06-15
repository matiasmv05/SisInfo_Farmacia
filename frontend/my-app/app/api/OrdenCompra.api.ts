// app/api/OrdenCompra.api.ts

import {
  OrdenCompraResponseDto,
  PaginatedOrdenResponse,
  CrearOrdenCompraDto,
} from "../types/OrdenCompra.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("farmacia_token") ??
        localStorage.getItem("farmacia_token"))
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── GET /api/ordenes-compra?estado=...&page=...&limit=... ──────────────────
export async function fetchOrdenesApi(params: {
  estado?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedOrdenResponse> {
  const query = new URLSearchParams();
  if (params.estado) query.set("estado", params.estado);
  query.set("page", String(params.page ?? 0));
  query.set("limit", String(params.limit ?? 20));

  const res = await fetch(`${BASE_URL}/api/ordenes-compra?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── GET /api/ordenes-compra/{id} ───────────────────────────────────────────
export async function fetchOrdenByIdApi(
  id: number
): Promise<OrdenCompraResponseDto> {
  const res = await fetch(`${BASE_URL}/api/ordenes-compra/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── POST /api/ordenes-compra ───────────────────────────────────────────────
export async function crearOrdenApi(
  dto: CrearOrdenCompraDto
): Promise<OrdenCompraResponseDto> {
  const res = await fetch(`${BASE_URL}/api/ordenes-compra`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── PATCH /api/ordenes-compra/{id}/emitir ──────────────────────────────────
export async function emitirOrdenApi(
  id: number
): Promise<OrdenCompraResponseDto> {
  const res = await fetch(`${BASE_URL}/api/ordenes-compra/${id}/emitir`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── PATCH /api/ordenes-compra/{id}/cancelar ────────────────────────────────
export async function cancelarOrdenApi(
  id: number
): Promise<OrdenCompraResponseDto> {
  const res = await fetch(`${BASE_URL}/api/ordenes-compra/${id}/cancelar`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── GET /api/ordenes-compra/producto/{productoId}/en-transito ───────────────
// Retorna la cantidad de unidades pedidas que aún no llegaron al almacén
export async function fetchStockEnTransitoApi(productoId: number): Promise<number> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/ordenes-compra/producto/${productoId}/en-transito`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) return 0;
    const body = await res.json();
    return body.stockEnTransito ?? 0;
  } catch {
    return 0;
  }
}
