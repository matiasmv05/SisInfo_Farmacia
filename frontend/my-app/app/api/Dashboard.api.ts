import { AlertaInventario, PaginatedResponse } from "../types/dashboard.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function authHeaders(): HeadersInit {
  const token =
    localStorage.getItem("farmacia_token") ??
    sessionStorage.getItem("farmacia_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Alertas críticas de inventario ───────────────────────────
export async function getAlertasCriticas(
  page = 0,
  limit = 10
): Promise<PaginatedResponse<AlertaInventario>> {
  const res = await fetch(
    `${API_BASE}/api/productos/stock-critico?page=${page}&limit=${limit}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Error al obtener alertas críticas");
  return res.json();
}

// ── KPIs del dashboard ────────────────────────────────────────
export async function getKpiDashboard(): Promise<{
  alertasActivas: number;
  alertasCriticas: number;
  alertasMedias: number;
  porcentajeStockCritico: number;
  porcentajeProximosVencer: number;
  ordenesPendientes: number;
}> {
  const res = await fetch(`${API_BASE}/api/dashboard/kpi`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener KPIs");
  return res.json();
}

// ── Distribución ABC ──────────────────────────────────────────
export async function getDistribucionABC(): Promise<{
  A: { porcentajeInversion: number; porcentajeSkus: number };
  B: { porcentajeInversion: number; porcentajeSkus: number };
  C: { porcentajeInversion: number; porcentajeSkus: number };
}> {
  const res = await fetch(`${API_BASE}/api/productos/clasificacion-abc/resumen`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener distribución ABC");
  return res.json();
}