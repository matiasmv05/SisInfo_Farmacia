// app/types/Abc.types.ts

export type AbcClassification = 'A' | 'B' | 'C';

// ─── Espejo exacto de ClasificacionAbcDetalleDTO del backend ─────────────────
export interface AbcDetalleDTO {
  productoId: number;
  productoNombre: string;
  laboratorio: string;
  unidadesDespachadas: number;   // valorInventario en el backend
  porcentajeIndividual: number;
  porcentajeAcumulado: number;
  clasificacion: string;          // "A" | "B" | "C" como string del backend
}

// ─── Espejo exacto de ClasificacionAbcHistorialDTO del backend ────────────────
export interface AbcHistorialDTO {
  id: number;
  fechaCalculo: string;           // ISO OffsetDateTime → string en JSON
  usuarioNombre: string;
  totalProductos: number;
  totalUnidadesDespachadas: number;
  observaciones: string;
  completado: boolean;
  detalles: AbcDetalleDTO[];
}

// ─── Tipo enriquecido para la UI (derivado de AbcDetalleDTO) ──────────────────
export interface AbcItem {
  productoId: number;
  codigo: string;                 // usamos productoId como código de display
  articulo: string;               // productoNombre
  laboratorio: string;
  valor: number;                  // unidadesDespachadas (valor de rotación)
  porcentajeIndividual: number;
  porcentajeAcumulado: number;
  clasificacion: AbcClassification;
}

// ─── Resúmenes para las Bento Cards ──────────────────────────────────────────
export interface AbcCategorySummary {
  categoria: AbcClassification;
  nombre: string;
  valorPorcentaje: number;        // % del valor total de inventario
  catalogoPorcentaje: number;     // % del catálogo de productos
  totalProductos: number;
  etiqueta: string;
}

// ─── Información del último cálculo (metadatos del historial) ────────────────
export interface AbcMetadata {
  id: number;
  fechaCalculo: string;
  usuarioNombre: string;
  totalProductos: number;
  totalUnidadesDespachadas: number;
  observaciones: string;
}