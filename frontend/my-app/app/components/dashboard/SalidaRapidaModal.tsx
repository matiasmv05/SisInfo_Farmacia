"use client";
// app/components/dashboard/SalidaRapidaModal.tsx

import { useEffect, useState } from "react";
import { registrarSalidaApi } from "../../api/Dashboard.api";

interface Props {
  productoId:     number;
  productoNombre: string;
  stockActual:    number;
  onConfirm:      () => void | Promise<void>;
  onClose:        () => void;
}

export default function SalidaRapidaModal({
  productoId,
  productoNombre,
  stockActual,
  onConfirm,
  onClose,
}: Props) {
  const [cantidad,   setCantidad]   = useState<string>("1");
  const [guardando,  setGuardando]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const cantidadNum = parseInt(cantidad, 10);
  const cantidadValida = !isNaN(cantidadNum) && cantidadNum > 0 && cantidadNum <= stockActual;

  const handleConfirmar = async () => {
    if (!cantidadValida) {
      setError(`Cantidad inválida. Máximo disponible: ${stockActual}`);
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await registrarSalidaApi(productoId, cantidadNum);
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
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-primary">output</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Registrar Salida
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Info del producto */}
          <div className="p-3 bg-surface-container rounded-lg border border-outline-variant space-y-1.5">
            <div className="flex justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Producto</span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium truncate max-w-[180px] text-right">
                {productoNombre}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Stock disponible</span>
              <span className="font-data-mono text-data-mono text-on-surface">{stockActual} uds.</span>
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5">
              Cantidad a despachar <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-2">
              {/* Botón decremento */}
              <button
                type="button"
                onClick={() => setCantidad(v => String(Math.max(1, parseInt(v || "1", 10) - 1)))}
                className="w-9 h-9 rounded-md border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <input
                type="number"
                value={cantidad}
                min={1}
                max={stockActual}
                onChange={e => { setCantidad(e.target.value); setError(null); }}
                className="
                  flex-1 text-center px-3 py-2 rounded-md border border-outline-variant bg-surface
                  font-data-mono text-data-mono text-on-surface text-lg
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                  transition-colors
                "
              />
              {/* Botón incremento */}
              <button
                type="button"
                onClick={() => setCantidad(v => String(Math.min(stockActual, parseInt(v || "0", 10) + 1)))}
                className="w-9 h-9 rounded-md border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
            {/* Barra de progreso visual */}
            {cantidadValida && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-outline/10">
                <div
                  className="h-full rounded-full bg-primary/50 transition-all duration-200"
                  style={{ width: `${(cantidadNum / stockActual) * 100}%` }}
                />
              </div>
            )}
            {error && (
              <div className="mt-2 p-2.5 bg-error/10 border border-error/30 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-error mt-0.5 shrink-0">error</span>
                <p className="font-body-sm text-body-sm text-error leading-tight flex-1">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Nota: la salida sigue FEFO automáticamente en el backend */}
          <p className="font-body-xs text-body-xs text-on-surface-variant flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">info</span>
            El descuento se aplica por orden de vencimiento (FEFO) automáticamente.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2 border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded-md hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={guardando || !cantidadValida}
            className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {guardando && (
              <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
            )}
            {guardando ? "Registrando…" : "Confirmar salida"}
          </button>
        </div>

      </div>
    </div>
  );
}