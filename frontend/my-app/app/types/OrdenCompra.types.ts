// app/types/OrdenCompra.types.ts

export type EstadoOrden = "draft" | "issued" | "received" | "canceled";

export interface OrdenCompra {
  id: string;
  fecha: string;
  proveedor: string;
  total: number;
  estado: EstadoOrden;
}

export interface OrdenCompraFiltersState {
  busqueda: string;
  estado: EstadoOrden | "";
  fechaDesde: string;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  total: number;
}
