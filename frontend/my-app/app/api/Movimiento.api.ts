// app/api/Movimiento.api.ts

import {
  MovimientoDetalleDto,
  SalidaRequestDto,
  AjusteRequestDto,
  PaginatedMovimientoResponse,
  LoteDetalleDto,
  PaginatedLoteResponse,
} from "../types/Movimiento.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("farmacia_token") ?? localStorage.getItem("farmacia_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseError(errorText: string): string {
  try {
    const errJson = JSON.parse(errorText);
    if (errJson.errors && Array.isArray(errJson.errors)) {
      return errJson.errors.map((e: any) => e.defaultMessage || e.code).join(", ");
    }
    if (errJson.message) return errJson.message;
  } catch { /* not JSON */ }
  return errorText;
}

// ─── POST /api/movimientos/salida ────────────────────────────────────────
export async function salidaApi(dto: SalidaRequestDto): Promise<MovimientoDetalleDto[]> {
  const res = await fetch(`${BASE_URL}/api/movimientos/salida`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(parseError(await res.text()));
  return res.json();
}

// ─── POST /api/movimientos/ajuste-salida ─────────────────────────────────
export async function ajusteSalidaApi(dto: AjusteRequestDto): Promise<MovimientoDetalleDto> {
  const res = await fetch(`${BASE_URL}/api/movimientos/ajuste-salida`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(parseError(await res.text()));
  return res.json();
}

// ─── POST /api/movimientos/ajuste-entrada ────────────────────────────────
export async function ajusteEntradaApi(dto: AjusteRequestDto): Promise<MovimientoDetalleDto> {
  const res = await fetch(`${BASE_URL}/api/movimientos/ajuste-entrada`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(parseError(await res.text()));
  return res.json();
}

// ─── GET /api/movimientos/producto/{id}?page=&limit= ─────────────────────
export async function fetchMovimientosProductoApi(params: {
  productoId: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedMovimientoResponse> {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    limit: String(params.limit ?? 20),
  });
  const res = await fetch(
    `${BASE_URL}/api/movimientos/producto/${params.productoId}?${query}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error(parseError(await res.text()));
  return res.json();
}

// ─── GET /api/lotes/producto/{productoId}?page=&limit= ───────────────────
export async function fetchLotesProductoApi(params: {
  productoId: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedLoteResponse> {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    limit: String(params.limit ?? 50),
  });
  const res = await fetch(
    `${BASE_URL}/api/lotes/producto/${params.productoId}?${query}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error(parseError(await res.text()));
  return res.json();
}
