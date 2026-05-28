// app/types/OrdenCompra.types.ts

/**
 * Mirrors backend EstadoOrden enum values exactly.
 */
export type EstadoOrden =
  | "borrador"
  | "emitida"
  | "recibida"
  | "recibida_parcial"
  | "cancelada";

/**
 * Mirrors backend ordenCompraItemDto (response for each item).
 */
export interface OrdenCompraItemDto {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidadSolicitada: number;
  costoUnitario: number | null;
  completo: boolean;
}

/**
 * Mirrors backend ordenCompraResponseDto (full order response).
 */
export interface OrdenCompraResponseDto {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  estado: EstadoOrden;
  fechaEmision: string | null;
  fechaRecepcion: string | null;
  montoTotal: number | null;
  notas: string | null;
  createdAt: string | null;
  items: OrdenCompraItemDto[];
}

export interface OrdenCompraItemRequestDto {
  productoId: number;
  cantidadSolicitada: number;
  costoUnitario?: number;
}

export interface CrearOrdenCompraDto {
  proveedorId: number;
  notas?: string;
  items: OrdenCompraItemRequestDto[];
}


export interface PaginatedOrdenResponse {
  data: OrdenCompraResponseDto[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
