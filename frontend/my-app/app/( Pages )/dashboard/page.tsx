// app/(Pages)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import KpiCard from "../../components/dashboard/KPICard";
import AlertsTable from "../../components/dashboard/AlertsTable";
import AbcDistribution from "../../components/dashboard/AbcDistribution";
import { getDashboardData, DashboardData } from "../../service/Dashboard.service";
import { generarAlertasManualApi } from "../../api/Dashboard.api";

// ─── Skeleton para KPI cards ──────────────────────────────────────────────────
function KpiSkeleton() {
  return (
    <div className="col-span-12 md:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-lg p-5 animate-pulse">
      <div className="h-4 bg-surface-container rounded w-2/3 mb-4" />
      <div className="h-8 bg-surface-container rounded w-1/2 mb-2" />
      <div className="h-3 bg-surface-container rounded w-1/3" />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [generandoAlertas, setGenerandoAlertas] = useState(false);

  const refreshDashboard = () => {
    getDashboardData()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar"))
      .finally(() => setLoading(false));
  };

  const handleGenerarAlertas = async () => {
    setGenerandoAlertas(true);
    try {
      await generarAlertasManualApi();
      // Refresca inmediatamente después de generar
      await refreshDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar alertas");
    } finally {
      setGenerandoAlertas(false);
    }
  };

  useEffect(() => {
    refreshDashboard(); // Carga inicial
    const interval = setInterval(refreshDashboard, 30000); // Refresco cada 30 seg
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-headline-md font-headline-md text-on-surface">
            Visión General
          </h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Resumen del estado del inventario al día de hoy.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerarAlertas}
            disabled={generandoAlertas}
            className="bg-surface-container-lowest border border-tertiary text-tertiary px-4 py-2 rounded font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            {generandoAlertas ? "Generando..." : "Generar Alertas"}
          </button>
          <Link href="/movimiento" className="bg-surface-container-lowest border border-primary text-primary px-4 py-2 rounded font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">remove</span>
            Registrar Salida
          </Link>
          <Link href="/recepcion" className="bg-primary text-on-primary px-4 py-2 rounded font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Registrar Ingreso
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 bg-error-container/20 border border-error/30 text-error rounded-lg px-4 py-3 text-body-sm">
          <span className="material-symbols-outlined text-[18px]">error_outline</span>
          {error}
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* KPI Cards */}
        {loading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              title="Alertas Activas"
              icon="warning"
              iconColorClass="text-error"
              value={(data?.kpis.alertasActivas ?? 0).toString()}
            >
              <div className="flex gap-3 mt-2 text-label-sm font-label-sm">
                <span className="flex items-center gap-1 text-error">
                  <span className="w-2 h-2 rounded-full bg-error inline-block" />
                  {data?.kpis.alertasCriticas ?? 0} Críticas
                </span>
                <span className="flex items-center gap-1 text-[#d97706]">
                  <span className="w-2 h-2 rounded-full bg-[#d97706] inline-block" />
                  {data?.kpis.alertasMedias ?? 0} Medias
                </span>
              </div>
            </KpiCard>

            <KpiCard
              title="% Stock Crítico"
              icon="trending_down"
              iconColorClass="text-primary"
              value={`${data?.kpis.porcentajeStockCritico ?? 0}%`}
            >
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                Del total de SKUs
              </p>
            </KpiCard>

            <KpiCard
              title="% Próximos a Vencer"
              icon="event_busy"
              iconColorClass="text-primary"
              value={`${data?.kpis.porcentajeProximosVencer ?? 0}%`}
            >
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                &lt; 90 días
              </p>
            </KpiCard>

            <KpiCard
              title="Órdenes Pendientes"
              icon="pending_actions"
              iconColorClass="text-primary"
              value={(data?.kpis.ordenesPendientes ?? 0).toString()}
            >
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                En tránsito o espera
              </p>
            </KpiCard>
          </>
        )}

        {/* Tabla de alertas */}
        {loading ? (
          <div className="col-span-12 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg p-5 animate-pulse h-64" />
        ) : (
          <AlertsTable
            alerts={data?.alertas ?? []}
            total={data?.totalAlertas ?? 0}
            onAlertAction={refreshDashboard}
          />
        )}

        {/* Distribución ABC */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          {loading ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 animate-pulse h-64" />
          ) : (
            <AbcDistribution
              items={data?.distribucionAbc ?? []}
              disponible={data?.abcDisponible ?? false}
            />
          )}
        </div>

      </div>
    </>
  );
}