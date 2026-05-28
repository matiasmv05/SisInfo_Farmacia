// app/components/ProtocolAlert.tsx
"use client";

import React from "react";

interface ProtocolAlertProps {
  required: boolean;
  witnessName: string;
  onChangeWitness: (name: string) => void;
}

export function ProtocolAlert({
  required,
  witnessName,
  onChangeWitness,
}: ProtocolAlertProps) {
  if (!required) return null;

  return (
    <div className="bg-[#ffdad6]/20 border border-[#ba1a1a]/30 rounded p-md flex flex-col gap-sm animate-pulse-slow">
      <div className="flex items-start gap-sm">
        <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] mt-[2px] shrink-0">
          info
        </span>
        <div>
          <span className="font-label-sm text-label-sm text-[#ba1a1a] uppercase block mb-[2px] font-bold tracking-wider">
            Alerta de Protocolo
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Se requiere doble firma para la generación del manifiesto de despacho debido a la clasificación especial de este producto (Medicamento Controlado o de Alto Riesgo).
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-xs mt-xs">
        <label className="font-label-sm text-[11px] text-[#ba1a1a] uppercase font-bold">
          Nombre del Testigo / Farmacéutico Firmante
        </label>
        <input
          type="text"
          value={witnessName}
          onChange={(e) => onChangeWitness(e.target.value)}
          placeholder="Escriba nombre o credencial del testigo..."
          className="w-full h-[32px] px-sm border border-[#ba1a1a]/30 rounded font-body-sm text-body-sm outline-none bg-surface-bright focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a] transition-all text-on-surface"
        />
      </div>
    </div>
  );
}
