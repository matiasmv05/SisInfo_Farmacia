// ── Alertas ──────────────────────────────────────────────────
export type EstadoAlerta = "STOCK_CRÍTICO" | "VENCE < 15 DÍAS" | "STOCK BAJO";

export interface AlertaInventario {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  estado: EstadoAlerta;
}

// ── Métricas KPI ─────────────────────────────────────────────
export interface KpiMetrica {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  detalle?: string;
  icono: string;
}

// ── Clasificación ABC ─────────────────────────────────────────
export type ClaseABC = "A" | "B" | "C";

export interface DistribucionABC {
  clase: ClaseABC;
  porcentajeInversion: number;
  porcentajeSkus: number;
  color: string;
}

// ── Respuesta paginada genérica ───────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface KPI {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
}

export interface InventoryAlert {
  sku: string;
  product: string;
  category: string;
  stock: number;
  status: string;
}