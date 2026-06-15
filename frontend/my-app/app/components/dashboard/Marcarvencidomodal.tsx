'use client';
// app/components/dashboard/MarcarVencidoModal.tsx

import { useEffect, useState } from 'react';
import { marcarLoteVencidoApi } from '../../api/Dashboard.api';

interface Props {
  loteId: number;
  numeroLote: string;
  productoNombre: string;
  cantidad: number;
  onConfirm: () => void | Promise<void>;   // callback para refrescar la tabla tras confirmar
  onClose: () => void;
}

export default function MarcarVencidoModal({
  loteId,
  numeroLote,
  productoNombre,
  cantidad,
  onConfirm,
  onClose,
}: Props) {
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleConfirmar = async () => {
    if (!motivo.trim()) {
      setError('El motivo es obligatorio.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await marcarLoteVencidoApi(loteId, motivo.trim());
      // Esperar a que onConfirm se complete (que incluye marcar la alerta como leída)
      if (onConfirm && typeof onConfirm === 'function') {
        await onConfirm();
      }
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-error">delete</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Declarar Lote Vencido
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Info del lote */}
          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant space-y-1">
            <div className="flex justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Producto</span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium">{productoNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Lote</span>
              <span className="font-data-mono text-data-mono text-on-surface">{numeroLote}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Unidades a dar de baja</span>
              <span className="font-data-mono text-data-mono text-error font-medium">{cantidad}</span>
            </div>
          </div>

          {/* Advertencia */}
          <div className="flex items-start gap-2 p-3 bg-error-container/30 border border-error/20 rounded-lg">
            <span className="material-symbols-outlined text-[18px] text-error mt-0.5">warning</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Esta acción es irreversible. El lote quedará con cantidad <strong>0</strong> y estado <strong>vencido</strong>.
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Motivo <span className="text-error">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => { setMotivo(e.target.value); setError(null); }}
              maxLength={500}
              rows={3}
              placeholder="Ej. Lote vencido según fecha de vencimiento, deterioro visible..."
              className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2 transition-shadow resize-none"
            />
            <div className="flex justify-between mt-1">
              {error && (
                <span className="font-body-sm text-body-sm text-error">{error}</span>
              )}
              <span className="font-body-sm text-body-sm text-on-surface-variant ml-auto">
                {motivo.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={guardando}
            className="px-5 py-2 border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={guardando || !motivo.trim()}
            className="px-5 py-2 bg-error text-on-error font-label-md text-label-md rounded-md hover:bg-error/90 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {guardando && (
              <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
            )}
            {guardando ? 'Procesando…' : 'Confirmar baja'}
          </button>
        </div>
      </div>
    </div>
  );
}