// app/api/Dashboard.api.ts

import { AlertaDetalleDTO, PaginatedResponse } from "../types/dashboard.types";
import { AbcHistorialDTO } from "../types/Abc.types";

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

function parseErrorMessage(errorText: string): string {
  try {
    const errJson = JSON.parse(errorText);
    // Prioridad: message > error > responseMessage
    if (errJson.message) return errJson.message;
    if (errJson.error) return errJson.error;
    if (errJson.responseMessage) return errJson.responseMessage;
    if (errJson.errors && Array.isArray(errJson.errors)) {
      return errJson.errors.map((e: any) => e.defaultMessage || e.code).join(", ");
    }
  } catch { /* not JSON */ }
  return errorText;
}

function getCurrentUserId(): number {
  if (typeof window === "undefined") return 0;
  try {
    const userJson = sessionStorage.getItem("farmacia_user") ?? localStorage.getItem("farmacia_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.id ?? 0;
    }
  } catch { /* parsing error */ }
  return 0;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.message ?? body?.error ?? msg;
    } catch {
      /* sin body JSON */
    }
    throw new Error(msg);
  }
  return res.json();
}

// ─── GET /api/alertas?leida=false&page=0&limit=10 ────────────────────────────
export async function getAlertasActivasApi(
  page = 0,
  limit = 10
): Promise<PaginatedResponse<AlertaDetalleDTO>> {
  const res = await fetch(
    `${BASE_URL}/api/alertas?leida=false&page=${page}&limit=${limit}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
}

// ─── GET /api/alertas/resumen ─────────────────────────────────────────────────
// Devuelve conteos por criticidad para los KPI cards.
// Si el backend no tiene este endpoint, lo calculamos desde la lista de alertas.
export async function getResumenAlertasApi(): Promise<{
  total: number;
  alta: number;
  media: number;
  baja: number;
  vencimientos: number;
}> {
  const res = await fetch(`${BASE_URL}/api/alertas/resumen`, {
    headers: getAuthHeaders(),
  });
  // Si no existe el endpoint (404), calculamos desde la lista completa
  if (res.status === 404) {
    const todas = await getAlertasActivasApi(0, 100);
    const items = todas.data ?? [];
    return {
      total: todas.total ?? items.length,
      alta:  items.filter((a) => a.criticidad === "ALTA").length,
      media: items.filter((a) => a.criticidad === "MEDIA").length,
      baja:  items.filter((a) => a.criticidad === "BAJA").length,
      vencimientos: items.filter((a) => a.tipo === "vencimiento_rojo" || a.tipo === "vencimiento_amarillo" || a.tipo === "vencimiento_verde").length,
    };
  }
  return handleResponse(res);
}

// ─── GET /api/clasificacion-abc/ultimo ───────────────────────────────────────
// Reutilizamos el mismo endpoint que usa AbcContext para la distribución ABC.
export async function getUltimoAbcDashboardApi(): Promise<AbcHistorialDTO> {
  const res = await fetch(`${BASE_URL}/api/clasificacion-abc/ultimo`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// ─── GET /api/ordenes-compra?estado=emitida,recibida_parcial&page=0&limit=1 ────────────────────
// Cuenta órdenes emitidas que aún no fueron totalmente recibidas
export async function getOrdenesPendientesCountApi(): Promise<number> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/ordenes-compra?estado=emitida,recibida_parcial&page=0&limit=1`,
      { headers: getAuthHeaders() }
    );
    if (res.ok) {
      const body = await res.json();
      return body.totalElements ?? body.total ?? 0;
    }
  } catch {}
  return 0;
}

// ─── GET /api/productos/stock-critico ─────────────────────────────────────────
// Para calcular % stock crítico sobre el total de SKUs.
export async function getStockCriticoCountApi(): Promise<{
  criticos: number;
  totalSkus: number;
}> {
  // Obtener total de productos y productos en stock crítico en paralelo
  const [critiRes, totalRes] = await Promise.all([
    fetch(`${BASE_URL}/api/productos/stock-critico?page=0&limit=1`, {
      headers: getAuthHeaders(),
    }),
    fetch(`${BASE_URL}/api/productos?page=0&limit=1`, {
      headers: getAuthHeaders(),
    }),
  ]);

  const criticos = critiRes.ok
    ? ((await critiRes.json()) as PaginatedResponse<unknown>).totalElements ??
      ((await critiRes.clone().json()) as PaginatedResponse<unknown>).total ??
      0
    : 0;

  const totalSkus = totalRes.ok
    ? ((await totalRes.json()) as PaginatedResponse<unknown>).totalElements ??
      ((await totalRes.clone().json()) as PaginatedResponse<unknown>).total ??
      0
    : 0;

  return { criticos, totalSkus };
}

// ─── PATCH /api/alertas/{id}/leida ────────────────────────────────────────────
// Marca una alerta como leída tras ejecutar una acción sobre ella.
export async function marcarAlertaLeidaApi(alertaId: number): Promise<void> {
  const usuarioGestionaId = getCurrentUserId();
  if (!usuarioGestionaId) {
    throw new Error("No se pudo obtener el ID del usuario actual");
  }

  const res = await fetch(`${BASE_URL}/api/alertas/${alertaId}/leida`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ usuarioGestionaId }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    const msg = parseErrorMessage(errorText);
    throw new Error(msg);
  }
}

// ─── POST /api/alertas/generar (DEBUG) ──────────────────────────────────────
// Dispara manualmente la generación de alertas (útil para depuración)
export async function generarAlertasManualApi(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/alertas/generar`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorText = await res.text();
    const msg = parseErrorMessage(errorText);
    throw new Error(msg);
  }
}

// ─── PATCH /api/lotes/{id}/vencido ───────────────────────────────────────────
export async function marcarLoteVencidoApi(
  loteId: number,
  motivo: string,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/lotes/${loteId}/vencido`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ motivo }),
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.message ?? body?.error ?? msg;
    } catch { /* sin body JSON */ }
    throw new Error(msg);
  }
}

// ─── POST /api/movimientos/salida ─────────────────────────────────────────────
// Registra una salida rápida desde el dashboard.
// Espeja SalidaRequestDTO del backend — ajustá los campos si tu DTO tiene más.
export async function registrarSalidaApi(
  productoId: number,
  cantidad: number,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/movimientos/salida`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ productoId, cantidad }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    const msg = parseErrorMessage(errorText);
    throw new Error(msg);
  }
}
