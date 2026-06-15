'use client';

import React, { useState } from 'react';
import { exportarReporteApi } from '../../api/Reporte.api';

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio]   = useState<string>('');
  const [fechaFin, setFechaFin]         = useState<string>('');
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType]       = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleGenerarReporte = async (tipo: string, nombre: string) => {
    if (tipo === 'PERDIDAS' && (!fechaInicio || !fechaFin)) {
      showToast('Selecciona Fecha de Inicio y Fin para el reporte de pérdidas.', 'error');
      return;
    }
    setLoadingReport(tipo);
    showToast(`Generando reporte de ${nombre}...`, 'success');

    const response = await exportarReporteApi({
      tipo,
      fechaInicio: fechaInicio || undefined,
      fechaFin:    fechaFin    || undefined,
    });

    setLoadingReport(null);

    if (response.success) {
      const filename = `reporte_${tipo.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
      const url  = window.URL.createObjectURL(response.blob);
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast(`¡Reporte de ${nombre} descargado correctamente!`, 'success');
    } else {
      showToast(response.message, 'error');
    }
  };

  return (
    <>
      {/* ── CABECERA ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-headline-md font-headline-md text-on-surface">
          Reportes Operativos y Financieros
        </h2>
        <p className="text-body-md font-body-md text-on-surface-variant mt-1">
          Exporte documentos en formato PDF con gráficos estadísticos integrados para análisis y auditoría.
        </p>
      </div>

      {/* ── FILTROS GLOBALES ─────────────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 mb-6">
        {/* Título filtros */}
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            filter_list
          </span>
          <h3 className="text-title-sm font-title-sm text-on-surface">
            Filtros Globales de Reporte
          </h3>
        </div>

        {/* Grid fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded-md text-body-md font-body-md text-on-surface bg-surface-container focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded-md text-body-md font-body-md text-on-surface bg-surface-container focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant">
              Estado de los Filtros
            </label>
            <p className="text-body-sm font-body-sm text-on-surface-variant py-2">
              {fechaInicio && fechaFin
                ? `Rango activo: ${fechaInicio} al ${fechaFin}`
                : 'Mostrando datos generales sin filtro de fecha.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── TARJETAS DE REPORTES ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CARD 1 — Valorización de Inventario */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col justify-between min-h-[240px] hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div>
            {/* Ícono */}
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <h3 className="text-title-md font-title-md text-on-surface mb-2">
              Reporte de Inventario
            </h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
              Valorización total del inventario actual por lote, clasificaciones ABC de productos y estadísticas generales.
            </p>
          </div>
          <button
            onClick={() => handleGenerarReporte('INVENTARIO', 'Inventario')}
            disabled={loadingReport !== null}
            className="mt-4 w-full border border-primary text-primary bg-surface-container-lowest px-4 py-2 rounded font-label-md text-label-md hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingReport === 'INVENTARIO' ? 'Generando...' : 'Generar PDF'}
          </button>
        </div>

        {/* CARD 2 — Pérdidas por Caducidad */}
        <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-error rounded-lg p-5 flex flex-col justify-between min-h-[240px] hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div>
            <div className="w-10 h-10 rounded-md bg-error/10 text-error flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[20px]">error</span>
            </div>
            <h3 className="text-title-md font-title-md text-on-surface mb-2">
              Reporte de Pérdidas
            </h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
              Medicamentos dados de baja por caducidad, cantidades y pérdidas económicas por período (requiere filtros de fecha).
            </p>
          </div>
          <button
            onClick={() => handleGenerarReporte('PERDIDAS', 'Pérdidas')}
            disabled={loadingReport !== null}
            className="mt-4 w-full border border-error text-error bg-surface-container-lowest px-4 py-2 rounded font-label-md text-label-md hover:bg-error/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingReport === 'PERDIDAS' ? 'Generando...' : 'Generar PDF de Pérdidas'}
          </button>
        </div>

        {/* CARD 3 — Alertas de Stock y Vencimiento */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col justify-between min-h-[240px] hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div>
            <div className="w-10 h-10 rounded-md bg-[#d97706]/10 text-[#d97706] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <h3 className="text-title-md font-title-md text-on-surface mb-2">
              Reporte de Alertas
            </h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
              Resumen crítico de productos con existencias por debajo del stock mínimo y lotes próximos a vencer.
            </p>
          </div>
          <button
            onClick={() => handleGenerarReporte('ALERTAS', 'Alertas')}
            disabled={loadingReport !== null}
            className="mt-4 w-full border border-primary text-primary bg-surface-container-lowest px-4 py-2 rounded font-label-md text-label-md hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingReport === 'ALERTAS' ? 'Generando...' : 'Generar PDF de Alerta'}
          </button>
        </div>

      </div>

      {/* ── TOAST ────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        <div
          className={`
            bg-surface-container-lowest border-l-4 rounded-md shadow-lg
            px-4 py-3 flex items-center gap-3
            min-w-[300px] max-w-[450px]
            text-body-sm font-body-sm text-on-surface
            transition-transform duration-300
            ${toastMessage ? 'translate-x-0' : 'translate-x-[120%]'}
            ${toastType === 'success' ? 'border-l-[color:var(--md-sys-color-tertiary,#16a34a)]' : 'border-l-error'}
          `}
        >
          {toastType === 'success' ? (
            <span className="material-symbols-outlined text-[20px] text-[#16a34a]">check_circle</span>
          ) : (
            <span className="material-symbols-outlined text-[20px] text-error">error</span>
          )}
          <span>{toastMessage}</span>
        </div>
      </div>
    </>
  );
}