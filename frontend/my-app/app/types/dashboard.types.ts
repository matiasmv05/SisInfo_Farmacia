// app/types/dashboard.types.ts

// ─── Alertas (espejo de AlertaDetalleDTO del backend) ─────────────────────────
export type CriticidadAlerta = "ALTA" | "MEDIA" | "BAJA";
export type TipoAlerta =
  | "stock_minimo"
  | "vencimiento_rojo"
  | "vencimiento_amarillo"
  | "vencimiento_verde";

export interface AlertaDetalleDTO {
  id: number;
  productoId: number;
  productoNombre: string;
  productoCategoria?: string;
  tipo: TipoAlerta;
  criticidad: CriticidadAlerta;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  stockActual?: number;
  stockMinimo?: number;
  loteId?: number;
  loteNumero?: string;
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────
export interface DashboardKpis {
  alertasActivas: number;
  alertasCriticas: number;       // criticidad ALTA
  alertasMedias: number;         // criticidad MEDIA
  porcentajeStockCritico: number;
  porcentajeProximosVencer: number;
  ordenesPendientes: number;
}

// ─── Distribución ABC (derivada del último historial ABC) ─────────────────────
export interface DistribucionAbcItem {
  clase: "A" | "B" | "C";
  porcentajeInversion: number;
  porcentajeSkus: number;
}

// ─── Respuesta paginada genérica ──────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalElements?: number;
}