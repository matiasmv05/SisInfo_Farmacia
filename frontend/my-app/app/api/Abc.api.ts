// app/api/Abc.api.ts

import { AbcHistorialDTO } from "../types/Abc.types";

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

// ─── Helper: lanza error con el mensaje del backend si lo hay ────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // body no es JSON — mantener mensaje genérico
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ─── GET /api/clasificacion-abc/ultimo ───────────────────────────────────────
// Devuelve el último cálculo ABC completado con todos sus detalles.
export async function fetchUltimoAbcApi(): Promise<AbcHistorialDTO> {
  const res = await fetch(`${BASE_URL}/api/clasificacion-abc/ultimo`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<AbcHistorialDTO>(res);
}

// ─── POST /api/clasificacion-abc/calcular ────────────────────────────────────
// Dispara un recálculo manual y devuelve el nuevo historial con detalles.
export async function recalcularAbcApi(
  observaciones: string = "Recálculo manual desde UI"
): Promise<AbcHistorialDTO> {
  const res = await fetch(`${BASE_URL}/api/clasificacion-abc/calcular`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ observaciones }),
  });
  return handleResponse<AbcHistorialDTO>(res);
}

// ─── GET /api/clasificacion-abc/{id} ─────────────────────────────────────────
// Obtiene un historial específico por ID con sus detalles.
export async function fetchAbcPorIdApi(id: number): Promise<AbcHistorialDTO> {
  const res = await fetch(`${BASE_URL}/api/clasificacion-abc/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<AbcHistorialDTO>(res);
}

// ─── GET /api/clasificacion-abc?page=0&limit=10 ──────────────────────────────
// Lista el historial de cálculos (sin detalles, solo metadatos).
export async function fetchHistorialAbcApi(
  page = 0,
  limit = 10
): Promise<{ data: AbcHistorialDTO[]; total: number; page: number }> {
  const res = await fetch(
    `${BASE_URL}/api/clasificacion-abc?page=${page}&limit=${limit}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
}