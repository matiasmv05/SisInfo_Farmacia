'use client';

import React, { useState } from 'react';
import { exportarReporteApi } from '../../api/Reporte.api';
import './reportes.css';

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleGenerarReporte = async (tipo: string, nombre: string) => {
    if (tipo === 'PERDIDAS' && (!fechaInicio || !fechaFin)) {
      showToast('Por favor, selecciona Fecha de Inicio y Fin para el reporte de pérdidas.', 'error');
      return;
    }

    setLoadingReport(tipo);
    showToast(`Generando reporte de ${nombre}...`, 'success');

    const response = await exportarReporteApi({
      tipo,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
    });

    setLoadingReport(null);

    if (response.success) {
      const filename = `reporte_${tipo.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
      const url = window.URL.createObjectURL(response.blob);
      const link = document.createElement('a');
      link.href = url;
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

  const handlePlaceholderReport = (nombre: string) => {
    showToast(`El reporte "${nombre}" no está habilitado temporalmente.`, 'error');
  };

  return (
    <div className="content-area">
      {/* CABECERA */}
      <header className="page-header">
        <h1>Reportes Operativos y Financieros</h1>
        <p>Exporte documentos en formato PDF con gráficos estadísticos integrados para análisis y auditoría</p>
      </header>

      {/* CARD: FILTROS GLOBALES */}
      <section className="filters-card">
        <div className="filters-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filtros Globales de Reporte</span>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="inputFechaInicio">Fecha de Inicio</label>
            <input 
              type="date" 
              id="inputFechaInicio" 
              className="filter-input" 
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="inputFechaFin">Fecha de Fin</label>
            <input 
              type="date" 
              id="inputFechaFin" 
              className="filter-input" 
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Estado de los Filtros</label>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '10px 0' }}>
              {fechaInicio && fechaFin 
                ? `Rango activo: ${fechaInicio} al ${fechaFin}` 
                : 'Mostrando datos generales sin filtro de fecha.'}
            </div>
          </div>
        </div>
      </section>

      {/* CUADRÍCULA DE REPORTES */}
      <section className="reports-grid">
        
        {/* CARD 1: Valorización de Inventario */}
        <article className="report-card">
          <div className="report-card-top">
            <div className="report-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Reporte de Inventario</h3>
            <p className="report-desc">
              Valorización total del inventario actual por lote, clasificaciones ABC de productos y estadísticas generales.
            </p>
          </div>
          <button 
            onClick={() => handleGenerarReporte("INVENTARIO", "Inventario")}
            className="c-btn c-btn--report-default w-full"
            disabled={loadingReport !== null}
          >
            {loadingReport === 'INVENTARIO' ? 'Generando...' : 'Generar PDF'}
          </button>
        </article>

        {/* CARD 2: Pérdidas por Caducidad (Danger) */}
        <article className="report-card report-card--danger">
          <div className="report-card-top">
            <div className="report-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3>Reporte de Pérdidas</h3>
            <p className="report-desc">
              Medicamentos dados de baja por caducidad, cantidades y pérdidas económicas por período (requiere filtros de fecha).
            </p>
          </div>
          <button 
            onClick={() => handleGenerarReporte("PERDIDAS", "Pérdidas")}
            className="c-btn c-btn--report-danger w-full"
            disabled={loadingReport !== null}
          >
            {loadingReport === 'PERDIDAS' ? 'Generando...' : 'Generar PDF de Pérdidas'}
          </button>
        </article>

        {/* CARD 3: Reporte de Alertas de Stock y Vencimiento */}
        <article className="report-card">
          <div className="report-card-top">
            <div className="report-icon-box" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3>Reporte de Alertas</h3>
            <p className="report-desc">
              Resumen crítico de productos con existencias por debajo del stock mínimo y lotes próximos a vencer.
            </p>
          </div>
          <button 
            onClick={() => handleGenerarReporte("ALERTAS", "Alertas")}
            className="c-btn c-btn--report-default w-full"
            disabled={loadingReport !== null}
          >
            {loadingReport === 'ALERTAS' ? 'Generando...' : 'Generar PDF de Alerta'}
          </button>
        </article>

        {/* CARD 4: Reporte de Proveedores */}
        <article className="report-card" style={{ opacity: 0.7 }}>
          <div className="report-card-top">
            <div className="report-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <h3>Órdenes de Proveedores</h3>
            <p className="report-desc">
              Listado de compras y recepciones agrupadas por proveedor. Permite evaluar volúmenes de compra. (No habilitado).
            </p>
          </div>
          <button 
            onClick={() => handlePlaceholderReport("Órdenes de Proveedores")}
            className="c-btn c-btn--report-default w-full"
            disabled={loadingReport !== null}
          >
            No Disponible
          </button>
        </article>

        {/* CARD 5: Clasificación ABC */}
        <article className="report-card" style={{ opacity: 0.7 }}>
          <div className="report-card-top">
            <div className="report-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </div>
            <h3>Movimientos Consolidados</h3>
            <p className="report-desc">
              Resumen de entradas y salidas generales del inventario durante el ciclo actual. (No habilitado).
            </p>
          </div>
          <button 
            onClick={() => handlePlaceholderReport("Movimientos Consolidados")}
            className="c-btn c-btn--report-default w-full"
            disabled={loadingReport !== null}
          >
            No Disponible
          </button>
        </article>

        {/* CARD 6: Auditoría de Usuarios */}
        <article className="report-card" style={{ opacity: 0.7 }}>
          <div className="report-card-top">
            <div className="report-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Historial de Exportaciones</h3>
            <p className="report-desc">
              Auditoría y control de exportaciones de reportes descargados por el personal operativo. (No habilitado).
            </p>
          </div>
          <button 
            onClick={() => handlePlaceholderReport("Historial de Exportaciones")}
            className="c-btn c-btn--report-default w-full"
            disabled={loadingReport !== null}
          >
            No Disponible
          </button>
        </article>

      </section>

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="toast-container">
        <div className={`toast toast--${toastType} ${toastMessage ? 'toast--show' : ''}`}>
          {toastType === 'success' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          <span>{toastMessage}</span>
        </div>
      </div>
    </div>
  );
}
