// app/types/Producto.types.ts

export type {
  CategoriaProducto,
  ProductoRequest  as NuevoProductoPayload,
  ProductoDetalle  as ProductoCreado,
} from './Inventario.types';

// Formulario local (campos pueden estar vacíos mientras el usuario escribe)
export interface NuevoProductoForm {
  nombreComercial: string;
  categoria: string | '';
  laboratorio: string;
  concentracion: string;
  presentacion: string;
  costoUnitario: number | '';
  precioVenta: number | '';
  stockMinimo: number | '';
  stockMaximo: number | '';
  diasMinimosVenta: number | '';
  activo: boolean;
  proveedorId: number | '';   // ← nuevo: id del proveedor seleccionado
}