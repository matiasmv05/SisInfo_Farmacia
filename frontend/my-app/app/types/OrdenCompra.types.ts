// app/types/OrdenCompra.types.ts


export type EstadoOrden =
  | "borrador"
  | "emitida"
  | "recibida"
  | "recibida_parcial"
  | "cancelada";

export interface OrdenCompraItemDto {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidadSolicitada: number;
  costoUnitario: number | null;
  completo: boolean;
}

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
