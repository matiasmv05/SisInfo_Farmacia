'use client';

import React, { useState } from 'react';
import './reportes.css';

export default function ReportesPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleGenerarReporte = (nombre: string) => {
    // Aquí iría la lógica de jsPDF u otra librería de generación
    showToast(`Generando reporte: ${nombre}...`);
  };

  return (
    <div className="content-area">
      {/* CABECERA */}
      <header className="page-header">
        <h1>Reportes Operativos y Financieros</h1>
        <p>Exporte documentos en formato PDF para análisis y auditoría</p>
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
            <input type="date" id="inputFechaInicio" className="filter-input" />
          </div>
          <div className="filter-group">
            <label htmlFor="inputFechaFin">Fecha de Fin</label>
            <input type="date" id="inputFechaFin" className="filter-input" />
          </div>
          <div className="filter-group">
            <label htmlFor="selectCategoria">Categoría (Opcional)</label>
            <select id="selectCategoria" className="filter-input">
              <option value="">Todas las Categorías</option>
              <option value="Analgésicos">Analgésicos</option>
              <option value="Antibióticos">Antibióticos</option>
              <option value="Antihistamínicos">Antihistamínicos</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Diabetes">Diabetes</option>
            </select>
          </div>
        </div>
      </section>

      {/* CUADRÍCULA DE REPORTES */}
      <section className="reports-grid">
        {/* CARD 1: Movimientos de Inventario */}
        <article className="report-card">
          <div className="report-card-top">
            <div className="report-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Movimientos de Inventario</h3>
            <p className="report-desc">
              Resumen detallado de ingresos (recepciones) y egresos (salidas/ventas) de productos durante el período seleccionado.
            </p>
          </div>
          <button 
            onClick={() => handleGenerarReporte("Movimientos de Inventario")}
            className="c-btn c-btn--report-default w-full"
          >
            Generar PDF
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
            <h3>Productos por Vencer</h3>
            <p className="report-desc">
              Listado crítico de lotes próximos a caducar o ya vencidos. Vital para auditorías y prevención de pérdidas.
            </p>
          </div>
          <button 
            onClick={() => handleGenerarReporte("Productos por Vencer")}
            className="c-btn c-btn--report-danger w-full"
          >
            Generar PDF de Alerta
          </button>
        </article>

        {/* CARD 3: Valorización del Inventario */}
        <article className="report-card">
          <div className="report-card-top">
            <div className="report-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Valorización de Inventario</h3>
            <p className="report-desc">
              Estimación del valor total del stock actual almacenado, calculado en base al costo unitario de cada lote disponible.
            </p>
          </div>
          <button 
            onClick={() => handleGenerarReporte("Valorización de Inventario")}
            className="c-btn c-btn--report-default w-full"
          >
            Generar PDF
          </button>
        </article>

        {/* CARD 4: Reporte de Proveedores */}
        <article className="report-card">
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
              Listado de compras y recepciones agrupadas por proveedor. Permite evaluar volúmenes de compra y fiabilidad.
            </p>
          </div>
          <button 
            onClick={() => handleGenerarReporte("Órdenes de Proveedores")}
            className="c-btn c-btn--report-default w-full"
          >
            Generar PDF
          </button>
        </article>

        {/* CARD 5: Clasificación ABC */}
        <article className="report-card">
          <div className="report-card-top">
            <div className="report-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </div>
            <h3>Clasificación ABC</h3>
            <p className="report-desc">
              Análisis de rotación de inventario segmentando los productos en categorías A (alta), B (media) y C (baja rotación).
            </p>
          </div>
          <button 
            onClick={() => handleGenerarReporte("Clasificación ABC")}
            className="c-btn c-btn--report-default w-full"
          >
            Generar PDF
          </button>
        </article>

        {/* CARD 6: Auditoría de Usuarios */}
        <article className="report-card">
          <div className="report-card-top">
            <div className="report-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Auditoría de Accesos</h3>
            <p className="report-desc">
              Registro de actividad del personal, estados de cuenta (activos/inactivos) y roles dentro del sistema.
            </p>
          </div>
          <button 
            onClick={() => handleGenerarReporte("Auditoría de Accesos")}
            className="c-btn c-btn--report-default w-full"
          >
            Generar PDF
          </button>
        </article>

      </section>

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="toast-container">
        <div className={`toast toast--success ${toastMessage ? 'toast--show' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      </div>
    </div>
  );
}
