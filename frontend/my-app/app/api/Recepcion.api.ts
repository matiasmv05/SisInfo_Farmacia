// app/api/Recepcion.api.ts

import {
  CrearRecepcionDto,
  PaginatedRecepcionResponse,
  RecepcionMercaderiaResponseDto,
} from "../types/Recepcion.types";

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

// ─── POST /api/recepciones ───────────────────────────────────────────────
export async function registrarRecepcionApi(
  dto: CrearRecepcionDto
): Promise<RecepcionMercaderiaResponseDto> {
  const res = await fetch(`${BASE_URL}/api/recepciones`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = `Error ${res.status}: ${errorText}`;
    try {
      const errJson = JSON.parse(errorText);
      if (errJson.message && errJson.errors && Array.isArray(errJson.errors)) {
        errorMessage = errJson.errors.map((e: any) => e.defaultMessage || e.code).join(', ');
      } else if (errJson.error && errJson.message) {
        errorMessage = errJson.message;
      }
    } catch (e) {
      // Not JSON, keep original error text
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

// ─── GET /api/recepciones/{id} ───────────────────────────────────────────
export async function fetchRecepcionByIdApi(
  id: number
): Promise<RecepcionMercaderiaResponseDto> {
  const res = await fetch(`${BASE_URL}/api/recepciones/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

// ─── GET /api/recepciones?ordenCompraId=...&page=...&limit=... ────────────
export async function fetchRecepcionesPorOrdenApi(params: {
  ordenCompraId: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedRecepcionResponse> {
  const query = new URLSearchParams({
    ordenCompraId: String(params.ordenCompraId),
    page: String(params.page ?? 0),
    limit: String(params.limit ?? 20),
  });

  const res = await fetch(`${BASE_URL}/api/recepciones?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  return res.json();
}
