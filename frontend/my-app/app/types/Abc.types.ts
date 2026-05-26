// app/types/Abc.types.ts

export type AbcClassification = 'A' | 'B' | 'C';

export interface AbcItem {
  codigo: string;
  articulo: string;
  stock: number;
  costo: number;
  valor: number; // stock * costo
  porcentajeIndividual: number;
  porcentajeAcumulado: number;
  clasificacion: AbcClassification;
}

export interface AbcCategorySummary {
  categoria: AbcClassification;
  nombre: string;         // e.g. "Cat. A"
  valorPorcentaje: number; // e.g. 80
  catalogoPorcentaje: number; // e.g. 20
  etiqueta: string;       // e.g. "Alto Valor"
}

export interface ParetoPoint {
  sku: string;
  valor: number;
}
