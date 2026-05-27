import KpiCard from '../components/KpiCard';
import AlertsTable from '../components/AlertsTable';
import AbcDistribution from '../components/AbcDistribution';
import { mockAlerts, mockAbcDistribution, mockKpiData } from '../service/mockData';

export default function DashboardPage() {
  return (
    <>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-headline-md font-headline-md text-on-surface">Visión General</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Resumen del estado del inventario al día de hoy.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-lowest border border-primary text-primary px-4 py-2 rounded font-label-md text-label-md hover:bg-surface-container-lowest/80 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">remove</span>
            Registrar Venta (Salida)
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Registrar Ingreso
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* KPI: Alertas Activas */}
        <KpiCard 
          title="Alertas Activas" 
          icon="warning" 
          iconColorClass="text-error" 
          value={mockKpiData.activeAlerts.total.toString()}
        >
          <div className="flex gap-3 mt-2 text-label-sm font-label-sm">
            <span className="flex items-center gap-1 text-error">
              <span className="w-2 h-2 rounded-full bg-error inline-block"></span> 
              {mockKpiData.activeAlerts.critical} Críticas
            </span>
            <span className="flex items-center gap-1 text-[#d97706]">
              <span className="w-2 h-2 rounded-full bg-[#d97706] inline-block"></span> 
              {mockKpiData.activeAlerts.medium} Medias
            </span>
          </div>
        </KpiCard>

        {/* KPI: % Stock Crítico */}
        <KpiCard 
          title="% Stock Crítico" 
          icon="trending_down" 
          iconColorClass="text-primary" 
          value={`${mockKpiData.criticalStockPercentage}%`}
        >
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
            Del total de SKUs
          </p>
        </KpiCard>

        {/* KPI: % Próximos a Vencer */}
        <KpiCard 
          title="% Próximos a Vencer" 
          icon="event_busy" 
          iconColorClass="text-primary" 
          value={`${mockKpiData.expiringPercentage}%`}
        >
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
            &lt; 90 días
          </p>
        </KpiCard>

        {/* KPI: Órdenes Pendientes */}
        <KpiCard 
          title="Órdenes Pendientes" 
          icon="pending_actions" 
          iconColorClass="text-primary" 
          value={mockKpiData.pendingOrders.toString()}
        >
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
            En tránsito o espera
          </p>
        </KpiCard>

        {/* Main Table Area */}
        <AlertsTable alerts={mockAlerts} />

        {/* Secondary Info Area */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          <AbcDistribution items={mockAbcDistribution} />
        </div>
      </div>
    </>
  );
}