import React from "react";
import { LoteDetalleDto } from "../../types/Movimiento.types";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface LoteCardProps {
  lote: LoteDetalleDto;
  isFirst: boolean;
}

export default function LoteCard({ lote, isFirst }: LoteCardProps) {
  const days = daysUntil(lote.fechaVencimiento);
  const isExpiringSoon = days <= 90;

  return (
    <div className={`relative p-4 rounded-lg border transition-all ${
      isFirst ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-outline-variant bg-surface"
    }`}>
      {isFirst && (
        <div className="absolute -top-2.5 left-3">
          <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            FEFO Sugerido
          </span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 mt-1">
        <div>
          <span className="block text-label-sm text-on-surface-variant mb-0.5">Lote</span>
          <span className="font-data-mono text-on-surface font-medium">{lote.numeroLote}</span>
        </div>
        <div>
          <span className="block text-label-sm text-on-surface-variant mb-0.5">Vencimiento</span>
          <span className={`font-data-mono font-medium ${isExpiringSoon ? "text-error" : "text-on-surface"}`}>
            {formatDate(lote.fechaVencimiento)}
          </span>
        </div>
        <div>
          <span className="block text-label-sm text-on-surface-variant mb-0.5">Disponible</span>
          <span className="font-data-mono text-on-surface font-medium">{lote.cantidad} uds</span>
        </div>
      </div>
      {isExpiringSoon && (
        <div className="mt-2 flex items-center gap-1.5 text-error text-label-sm">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          {days <= 0 ? "Vencido" : `Vence en ${days} días`}
        </div>
      )}
    </div>
  );
}
