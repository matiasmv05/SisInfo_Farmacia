import React, { useState, useEffect } from "react";
import { MovimientoDetalleDto } from "../../types/Movimiento.types";
import { fetchMovimientosProductoApi } from "../../api/Movimiento.api";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface HistorialModalProps {
  productoId: number;
  productoNombre: string;
  onClose: () => void;
}

const TIPO_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  entrada:              { label: "Entrada",           icon: "arrow_downward", color: "text-secondary" },
  salida:               { label: "Salida",            icon: "arrow_upward",   color: "text-error" },
  ajuste_entrada:       { label: "Ajuste +",          icon: "add_circle",     color: "text-secondary" },
  ajuste_salida:        { label: "Ajuste −",          icon: "remove_circle",  color: "text-error" },
  baja_vencimiento:     { label: "Baja Vencimiento",  icon: "event_busy",     color: "text-error" },
  devolucion_cliente:   { label: "Dev. Cliente",      icon: "undo",           color: "text-tertiary" },
  devolucion_proveedor: { label: "Dev. Proveedor",    icon: "redo",           color: "text-tertiary" },
};

export default function HistorialModal({
  productoId,
  productoNombre,
  onClose,
}: HistorialModalProps) {
  const [movimientos, setMovimientos] = useState<MovimientoDetalleDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMovimientosProductoApi({ productoId, limit: 50 });
        setMovimientos(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [productoId]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
          <div>
            <h3 className="font-headline-sm text-on-surface">Historial de Movimientos</h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5">{productoNombre}</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-primary">
              <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> Cargando...
            </div>
          ) : movimientos.length === 0 ? (
            <p className="text-center text-on-surface-variant py-12">Sin movimientos registrados.</p>
          ) : (
            <div className="space-y-3">
              {movimientos.map(m => {
                const cfg = TIPO_CONFIG[m.tipoMovimiento] || { label: m.tipoMovimiento, icon: "swap_horiz", color: "text-outline" };
                return (
                  <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant/50 hover:bg-surface-container/30 transition-colors">
                    <span className={`material-symbols-outlined mt-0.5 ${cfg.color}`}>{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-on-surface text-sm">{cfg.label}</span>
                        <span className={`font-data-mono font-bold text-sm ${cfg.color}`}>
                          {m.tipoMovimiento.includes("salida") || m.tipoMovimiento === "baja_vencimiento" ? "−" : "+"}{m.cantidad}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Lote: {m.loteNumero} · {formatDate(m.fechaHora)} · {m.usuarioNombre}
                      </p>
                      {m.motivo && <p className="text-[11px] text-outline italic mt-0.5">{m.motivo}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
