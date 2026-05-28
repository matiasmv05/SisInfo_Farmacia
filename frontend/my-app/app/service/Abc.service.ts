// app/service/Abc.service.ts
//
// Este servicio ya NO recalcula la clasificación ABC —
// esa lógica vive exclusivamente en el backend (ClasificacionAbcService.java).
// Aquí solo transformamos el DTO del backend al formato que necesitan los componentes.

import { AbcHistorialDTO, AbcItem, AbcCategorySummary, AbcMetadata } from "../types/Abc.types";

// ─── Transforma el DTO del backend en los tipos de UI ────────────────────────
export function transformAbcHistorial(historial: AbcHistorialDTO): {
  items: AbcItem[];
  summaries: AbcCategorySummary[];
  metadata: AbcMetadata;
} {
  // Mapear cada detalle del DTO a AbcItem
  const items: AbcItem[] = historial.detalles.map((d) => ({
    productoId: d.productoId,
    codigo: `P-${String(d.productoId).padStart(4, "0")}`,
    articulo: d.productoNombre,
    laboratorio: d.laboratorio ?? "—",
    valor: Number(d.unidadesDespachadas) || 0,
    porcentajeIndividual: Number(d.porcentajeIndividual) || 0,
    porcentajeAcumulado: Number(d.porcentajeAcumulado) || 0,
    clasificacion: (d.clasificacion as "A" | "B" | "C") || "C",
  }));

  // Ya vienen ordenados por porcentajeAcumulado ASC del backend
  // (findByHistorialIdOrderByPorcentajeAcumuladoAsc)

  const totalItems = items.length;
  const totalValor = historial.totalUnidadesDespachadas || 0;

  const buildSummary = (
    cat: "A" | "B" | "C",
    etiqueta: string
  ): AbcCategorySummary => {
    const catItems = items.filter((i) => i.clasificacion === cat);
    const catValor = catItems.reduce((acc, i) => acc + i.valor, 0);

    const valorPct =
      totalValor > 0 ? Math.round((catValor / totalValor) * 100) : 0;
    const catalogoPct =
      totalItems > 0
        ? Math.round((catItems.length / totalItems) * 100)
        : 0;

    return {
      categoria: cat,
      nombre: `Cat. ${cat}`,
      valorPorcentaje: valorPct,
      catalogoPorcentaje: catalogoPct,
      totalProductos: catItems.length,
      etiqueta,
    };
  };

  const summaries: AbcCategorySummary[] = [
    buildSummary("A", "Alto Valor"),
    buildSummary("B", "Valor Medio"),
    buildSummary("C", "Bajo Valor"),
  ];

  const metadata: AbcMetadata = {
    id: historial.id,
    fechaCalculo: historial.fechaCalculo,
    usuarioNombre: historial.usuarioNombre,
    totalProductos: historial.totalProductos,
    totalUnidadesDespachadas: historial.totalUnidadesDespachadas,
    observaciones: historial.observaciones,
  };

  return { items, summaries, metadata };
}