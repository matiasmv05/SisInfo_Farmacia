// app/types/Recepcion.types.ts

export interface RecepcionDetalleRequestDto {
  ordenDetalleId: number;
  cantidadRecibida: number;
  numeroLote: string;
  fechaVencimiento: string; // ISO string for LocalDate (e.g. YYYY-MM-DD)
  observacionItem?: string;
}

export interface CrearRecepcionDto {
  ordenCompraId: number;
  observaciones?: string;
  items: RecepcionDetalleRequestDto[];
}

export interface RecepcionDetalleResponseDto {
  id: number;
  ordenDetalleId: number;
  productoId: number;
  productoNombre: string;
  cantidadSolicitada: number;
  cantidadRecibida: number;
  totalRecibido: number;
  completo: boolean;
  numeroLote: string;
  fechaVencimiento: string;
  costoUnitario: number;
  observacionItem?: string;
}

export interface RecepcionMercaderiaResponseDto {
  id: number;
  ordenCompraId: number;
  usuarioId: number;
  usuarioNombre: string;
  fechaHora: string; // ISO string
  observaciones?: string;
  items: RecepcionDetalleResponseDto[];
}

export interface PaginatedRecepcionResponse {
  data: RecepcionMercaderiaResponseDto[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
