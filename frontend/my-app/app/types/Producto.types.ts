// app/types/Producto.types.ts

export type CategoriaProducto =
  | 'antibiotics'
  | 'analgesics'
  | 'anti-inflammatories'
  | 'antipyretics'
  | 'vitamins'
  | '';

export type PresentacionProducto =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'ampoule'
  | 'cream'
  | 'drops'
  | '';

export interface NuevoProductoForm {
  nombreComercial: string;
  categoria: CategoriaProducto;
  laboratorio: string;
  concentracion: string;
  presentacion: PresentacionProducto;
  costoUnitario: number | '';
  precioVenta: number | '';
  stockMinimo: number | '';
  activo: boolean;
}

export interface NuevoProductoPayload {
  nombreComercial: string;
  categoria: string;
  laboratorio: string;
  concentracion: string;
  presentacion: string;
  costoUnitario: number;
  precioVenta: number;
  stockMinimo: number;
  activo: boolean;
}

export interface ProductoCreado extends NuevoProductoPayload {
  id: string;
  fechaCreacion: string;
}
