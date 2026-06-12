// app/services/Abc.service.ts

import { ProductMock } from "../api/Abc.api";
import { AbcItem, AbcCategorySummary } from "../types/Abc.types";

/**
 * Computa la clasificación ABC completa a partir de un listado de productos básico.
 * Sigue el principio de Pareto (80/20):
 * - Cat. A: ~80% del valor total acumulado (artículos de gran valor e impacto).
 * - Cat. B: ~15% del valor total acumulado (artículos de valor e impacto medio).
 * - Cat. C: ~5% del valor total acumulado (artículos de menor valor e impacto).
 */
export function calculateAbcClassification(products: ProductMock[]): {
  items: AbcItem[];
  summaries: AbcCategorySummary[];
} {
  if (products.length === 0) {
    return { items: [], summaries: [] };
  }

  // 1. Calcular el valor de cada artículo (Stock x Costo)
  const itemsWithValues = products.map((p) => {
    const valor = p.stock * p.costo;
    return {
      codigo: p.codigo,
      articulo: p.articulo,
      stock: p.stock,
      costo: p.costo,
      valor: Number(valor.toFixed(2)),
    };
  });

  // 2. Ordenar descendentemente por valor
  itemsWithValues.sort((a, b) => b.valor - a.valor);

  // 3. Obtener el valor total del inventario
  const totalValue = itemsWithValues.reduce((sum, item) => sum + item.valor, 0);

  // 4. Calcular los porcentajes individuales y acumulados
  let runningAcumulado = 0;
  const items: AbcItem[] = itemsWithValues.map((item, index) => {
    const porcentajeIndividual = totalValue > 0 ? (item.valor / totalValue) * 100 : 0;
    runningAcumulado += porcentajeIndividual;

    // Redondear el acumulado final del último artículo al 100% exacto para corregir decimales de JS
    const porcentajeAcumulado =
      index === itemsWithValues.length - 1 ? 100 : Number(runningAcumulado.toFixed(2));

    // 5. Asignar clasificación según el porcentaje acumulado
    // Umbrales estándar:
    // A: Primeros artículos hasta completar ~80%
    // B: Artículos siguientes hasta completar ~95%
    // C: Resto de los artículos hasta completar el 100%
    let clasificacion: 'A' | 'B' | 'C' = 'C';
    // Para reproducir fielmente el mock inicial del HTML si los valores son muy específicos,
    // usamos límites suaves. Si el porcentaje acumulado (previo a este artículo o con este)
    // está por debajo del 80% (o es el que cruza la línea), es A.
    // Usaremos un umbral clásico de Pareto:
    if (porcentajeAcumulado - porcentajeIndividual < 80) {
      clasificacion = 'A';
    } else if (porcentajeAcumulado - porcentajeIndividual < 95) {
      clasificacion = 'B';
    } else {
      clasificacion = 'C';
    }

    return {
      ...item,
      porcentajeIndividual: Number(porcentajeIndividual.toFixed(1)),
      porcentajeAcumulado: Number(porcentajeAcumulado.toFixed(1)),
      clasificacion,
    };
  });

  // 6. Generar resúmenes por categoría (Bento Cards stats)
  const totalItems = items.length;

  const getStatsForCategory = (cat: 'A' | 'B' | 'C', label: string, defaultVal: number, defaultCat: number) => {
    const catItems = items.filter((item) => item.clasificacion === cat);
    const catValue = catItems.reduce((sum, item) => sum + item.valor, 0);
    
    const valorPorcentaje = totalValue > 0 ? (catValue / totalValue) * 100 : 0;
    const catalogoPorcentaje = totalItems > 0 ? (catItems.length / totalItems) * 100 : 0;

    return {
      categoria: cat,
      nombre: `Cat. ${cat}`,
      // Retornar el cálculo exacto redondeado, o un valor de respaldo si es 0
      valorPorcentaje: totalValue > 0 ? Math.round(valorPorcentaje) : defaultVal,
      catalogoPorcentaje: totalItems > 0 ? Math.round(catalogoPorcentaje) : defaultCat,
      etiqueta: label,
    };
  };

  // Resúmenes basados en el estado del inventario real
  const summaries: AbcCategorySummary[] = [
    getStatsForCategory('A', 'Alto Valor', 80, 20),
    getStatsForCategory('B', 'Valor Medio', 15, 30),
    getStatsForCategory('C', 'Bajo Valor', 5, 50),
  ];

  return { items, summaries };
}
