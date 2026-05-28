// app/types/Movimiento.types.ts

export type TipoMovimiento =
  | "entrada"
  | "salida"
  | "ajuste_entrada"
  | "ajuste_salida"
  | "devolucion_cliente"
  | "devolucion_proveedor"
  | "baja_vencimiento";

export type EstadoLote = "activo" | "agotado" | "vencido";

export interface MovimientoDetalleDto {
  id: number;
  loteId: number;
  loteNumero: string;
  productoId: number;
  productoNombre: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  costoUnitario: number | null;
  motivo: string | null;
  usuarioId: number;
  usuarioNombre: string;
  proveedorNombre: string | null;
  ordenCompraId: number | null;
  referenciaId: number | null;
  fechaHora: string;
}

export interface SalidaRequestDto {
  productoId: number;
  cantidad: number;
}

export interface AjusteRequestDto {
  loteId: number;
  cantidad: number;
  motivo: string;
}

export interface LoteDetalleDto {
  id: number;
  productoId: number;
  productoNombre: string;
  numeroLote: string;
  cantidad: number;
  fechaVencimiento: string;
  costoUnitario: number;
  estado: EstadoLote;
  ordenCompraId: number | null;
  fechaRegistro: string;
  fechaBaja: string | null;
  motivoBaja: string | null;
}

export interface PaginatedLoteResponse {
  data: LoteDetalleDto[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedMovimientoResponse {
  data: MovimientoDetalleDto[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
