'use client';
// app/components/Inventario/ProductoDetalleModal.tsx

import { useEffect } from 'react';
import { ProductoDetalle, ClaseAbc } from '../../types/Inventario.types';

const abcBadgeConfig: Record<ClaseAbc, string> = {
  A: 'bg-status-a-bg text-status-a-text border border-status-a-text/20',
  B: 'bg-status-b-bg text-status-b-text border border-status-b-text/20',
  C: 'bg-status-c-bg text-status-c-text border border-status-c-text/20',
};

interface Props {
  producto: ProductoDetalle;
  onClose: () => void;
}

export default function ProductoDetalleModal({ producto, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-outline-variant/40 last:border-0">
      <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">{label}</span>
      <span className="font-body-sm text-body-sm text-on-surface text-right">{value ?? '—'}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-outline-variant">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              {producto.nombre}
              {producto.concentracion && (
                <span className="ml-2 font-body-md text-body-md text-on-surface-variant">
                  {producto.concentracion}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {producto.clasificacionAbc ? (
                <span className={`inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm ${abcBadgeConfig[producto.clasificacionAbc]}`}>
                  Clase {producto.clasificacionAbc}
                </span>
              ) : null}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                producto.activo
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-variant text-on-surface-variant'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${producto.activo ? 'bg-secondary' : 'bg-outline'}`} />
                {producto.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors mt-0.5">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-2">Identificación</p>
            <Row label="ID" value={<span className="font-data-mono text-data-mono">#{producto.id}</span>} />
            <Row label="Categoría" value={producto.categoria} />
            <Row label="Laboratorio" value={producto.laboratorio} />
            <Row label="Presentación" value={producto.presentacion} />
          </div>

          <div>
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-2">Stock</p>
            <Row label="Stock Total" value={
              <span className={`font-medium ${
                producto.stockTotal <= producto.stockMinimo ? 'text-status-critical' : 'text-status-good'
              }`}>
                {producto.stockTotal.toLocaleString()} unidades
              </span>
            } />
            <Row label="Stock Mínimo" value={`${producto.stockMinimo} unidades`} />
            <Row label="Stock Máximo" value={producto.stockMaximo ? `${producto.stockMaximo} unidades` : null} />
            <Row label="Días Mínimos Venta" value={producto.diasMinimosVenta ? `${producto.diasMinimosVenta} días` : null} />
          </div>

          <div>
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-2">Precios</p>
            <Row label="Costo Unitario" value={<span className="font-data-mono text-data-mono">Bs {producto.precioCosto?.toFixed(2)}</span>} />
            <Row label="Precio de Venta" value={<span className="font-data-mono text-data-mono font-medium">Bs {producto.precioVenta.toFixed(2)}</span>} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-md hover:bg-primary/90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}