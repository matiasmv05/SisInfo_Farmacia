// app/types/Inventario.types.ts
// ── Actualiza solo la interfaz PaginatedResponse ──

export type ClaseAbc = 'A' | 'B' | 'C';

export interface ProductoDetalle {
  id: number;
  nombre: string;
  categoria: string;
  laboratorio: string;
  concentracion: string;
  presentacion: string;
  precioCosto: number;
  precioVenta: number;
  stockMinimo: number;
  stockMaximo: number | null;
  stockTotal: number;
  clasificacionAbc: ClaseAbc | null;
  diasMinimosVenta: number | null;
  activo: boolean;
}

export interface ProductoRequest {
  nombre: string;
  categoria: string;
  laboratorio: string;
  concentracion: string;
  presentacion: string;
  precioCosto: number;
  precioVenta: number;
  stockMinimo: number;
  stockMaximo?: number;
  diasMinimosVenta?: number;
  activo: boolean;
}

// Alineado con PaginatedResponseDto.java del backend
export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;   // ← nombre real del backend
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type StockStatus = 'critical' | 'warning' | 'good';

export type CategoriaProducto =
  | 'ANTIBIOTICOS'
  | 'ANTIHIPERTENSIVOS'
  | 'ANTIDIABETICOS'
  | 'ANALGESICOS'
  | 'ANTIINFLAMATORIOS'
  | 'ANTIHISTAMINICOS'
  | 'ANTIGRIPALES'
  | 'PROTECTORES_GASTRICOS'
  | 'CARDIOLOGICOS'
  | 'RESPIRATORIOS'
  | 'DERMATOLOGICOS'
  | 'VITAMINAS_SUPLEMENTOS'
  | 'INSUMOS_MEDICOS'
  | 'CUIDADO_PERSONAL'
  | 'PEDIATRICO'
  | 'ORTOPEDIA'
  | 'OTROS';