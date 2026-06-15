// app/service/Dashboard.service.ts

import {
  getAlertasActivasApi,
  getResumenAlertasApi,
  getUltimoAbcDashboardApi,
  getOrdenesPendientesCountApi,
  getStockCriticoCountApi,
} from "../api/Dashboard.api";
import {
  AlertaDetalleDTO,
  DashboardKpis,
  DistribucionAbcItem,
} from "../types/dashboard.types";

export interface DashboardData {
  kpis: DashboardKpis;
  alertas: AlertaDetalleDTO[];
  totalAlertas: number;
  distribucionAbc: DistribucionAbcItem[];
  abcDisponible: boolean;       // false si nunca se ejecutó el análisis ABC
}

export async function getDashboardData(): Promise<DashboardData> {
  // Todas las llamadas en paralelo — si alguna falla, no rompe las demás
  const [resumenAlertas, alertasPage, ordenesPendientes, stockInfo, abcResult] =
    await Promise.allSettled([
      getResumenAlertasApi(),
      getAlertasActivasApi(0, 8),
      getOrdenesPendientesCountApi(),
      getStockCriticoCountApi(),
      getUltimoAbcDashboardApi(),
    ]);

  // ─── KPIs ────────────────────────────────────────────────────────────────
  const resumen =
    resumenAlertas.status === "fulfilled"
      ? resumenAlertas.value
      : { total: 0, alta: 0, media: 0, baja: 0, vencimientos: 0 };

  const stockData =
    stockInfo.status === "fulfilled"
      ? stockInfo.value
      : { criticos: 0, totalSkus: 0 };

  // Contar alertas de stock_minimo (son las que aparecen en la tabla)
  const alertasStockCritico = alertasPage.status === "fulfilled"
    ? (alertasPage.value.data ?? []).filter(a => a.tipo === 'stock_minimo').length
    : 0;

  // % Stock Crítico = alertas de stock_minimo / total SKUs
  const pctStockCritico =
    stockData.totalSkus > 0
      ? Number(((alertasStockCritico / stockData.totalSkus) * 100).toFixed(1))
      : 0;

  // Calcular % próximos a vencer usando la propiedad vencimientos del resumen
  const alertasVencimiento =
    resumenAlertas.status === "fulfilled" && "vencimientos" in resumen.valueOf()
      ? (resumen as any).vencimientos
      : 0;

  const pctProximosVencer =
    stockData.totalSkus > 0
      ? Number(((alertasVencimiento / stockData.totalSkus) * 100).toFixed(1))
      : 0;

  const kpis: DashboardKpis = {
    alertasActivas:           resumen.total,
    alertasCriticas:          resumen.alta,
    alertasMedias:            resumen.media,
    porcentajeStockCritico:   pctStockCritico,
    porcentajeProximosVencer: pctProximosVencer,
    ordenesPendientes:
      ordenesPendientes.status === "fulfilled" ? ordenesPendientes.value : 0,
  };

  // ─── Alertas para la tabla ────────────────────────────────────────────────
  const alertas =
    alertasPage.status === "fulfilled" ? (alertasPage.value.data ?? []) : [];
  const totalAlertas =
    alertasPage.status === "fulfilled" ? (alertasPage.value.total ?? 0) : 0;

  // ─── Distribución ABC ─────────────────────────────────────────────────────
  let distribucionAbc: DistribucionAbcItem[] = [];
  let abcDisponible = false;

  if (abcResult.status === "fulfilled") {
    abcDisponible = true;
    const detalles = abcResult.value.detalles ?? [];
    const total = detalles.length;
    const totalVal = abcResult.value.totalUnidadesDespachadas || 1;

    const calcular = (clase: "A" | "B" | "C"): DistribucionAbcItem => {
      const items = detalles.filter((d) => d.clasificacion === clase);
      const valClase = items.reduce(
        (acc, d) => acc + (Number(d.unidadesDespachadas) || 0),
        0
      );
      return {
        clase,
        porcentajeInversion: Number(((valClase / totalVal) * 100).toFixed(1)),
        porcentajeSkus:
          total > 0 ? Math.round((items.length / total) * 100) : 0,
      };
    };

    distribucionAbc = [calcular("A"), calcular("B"), calcular("C")];
  }

  return { kpis, alertas, totalAlertas, distribucionAbc, abcDisponible };
}