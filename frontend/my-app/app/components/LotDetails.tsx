// app/components/LotDetails.tsx
"use client";

import React from "react";
import { Lot } from "../types/Dispatch.types";

interface LotDetailsProps {
  lot: Lot | null;
  onLotChange?: (lot: Lot) => void;
  availableLots?: Lot[];
}

export function LotDetails({ lot, onLotChange, availableLots = [] }: LotDetailsProps) {
  if (!lot) {
    return (
      <div className="flex flex-col gap-xs">
        <label className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            inventory_2
          </span>
          Lote de Origen
        </label>
        <div className="bg-surface-container-low border border-outline-variant rounded p-md text-center py-xl text-on-surface-variant font-body-sm">
          No hay lotes disponibles para este producto.
        </div>
      </div>
    );
  }

  // Comprobar si está expirado o cerca de expirar
  const isExpired = new Date(lot.expiryDate) < new Date();
  // Cerca de expirar si expira en menos de 180 días (para el ambiente farmacéutico)
  const isNearExpiry = !isExpired && (new Date(lot.expiryDate).getTime() - new Date().getTime()) < 180 * 24 * 60 * 60 * 1000;

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center justify-between">
        <label className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            inventory_2
          </span>
          Lote de Origen
        </label>

        <span className="font-label-sm text-label-sm px-unit py-[2px] rounded border border-outline-variant bg-surface-container-high text-on-surface-variant uppercase flex items-center gap-[2px] select-none">
          <span className="material-symbols-outlined text-[12px] animate-pulse">
            auto_awesome
          </span>{" "}
          Preselección FEFO
        </span>
      </div>

      {/* Lot Details Card */}
      <div className="bg-surface-container-low border border-outline-variant rounded p-md flex flex-col gap-sm hover:border-primary transition-colors duration-200">
        <div className="flex items-start justify-between border-b border-outline-variant pb-sm">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-[2px]">
              NÚMERO DE LOTE
            </span>
            {availableLots.length > 1 && onLotChange ? (
              <select
                value={lot.id}
                onChange={(e) => {
                  const selected = availableLots.find((l) => l.id === e.target.value);
                  if (selected) onLotChange(selected);
                }}
                className="font-mono-table text-mono-table font-semibold text-on-surface bg-transparent border-none outline-none cursor-pointer focus:ring-0 p-0 pr-lg"
              >
                {availableLots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.lotNumber} {l.fefoPreselect ? " (FEFO)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-mono-table text-mono-table font-semibold text-on-surface">
                {lot.lotNumber}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-[2px]">
              VENCIMIENTO
            </span>
            <span
              className={`font-mono-table text-mono-table font-medium flex items-center justify-end gap-xs ${
                isExpired || isNearExpiry ? "text-error" : "text-on-surface"
              }`}
            >
              {(isExpired || isNearExpiry) && (
                <span className="material-symbols-outlined text-[14px]">
                  warning
                </span>
              )}
              {lot.expiryDate}
              {isExpired && " (EXPIRADO)"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-[4px]">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Cantidad Disponible
          </span>
          <span className="font-mono-table text-mono-table text-on-surface font-semibold">
            {lot.availableQuantity.toLocaleString()} Unidades
          </span>
        </div>
      </div>
    </div>
  );
}
