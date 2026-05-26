// app/types/Inventario.types.ts

export type ClaseAbc = 'A' | 'B' | 'C';

export interface InventarioItem {
  codigo: string;
  nombre: string;
  categoria: string;
  laboratorio: string;
  stock: number;
  minimo: number;
  claseAbc: ClaseAbc;
  precio: number;
}

export type StockStatus = 'critical' | 'warning' | 'good';
