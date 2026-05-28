// app/components/ProductStats.tsx
"use client";

import React, { useState } from "react";
import { Product } from "../types/Dispatch.types";

interface ProductStatsProps {
  product: Product | null;
}

export function ProductStats({ product }: ProductStatsProps) {
  const [imgError, setImgError] = useState(false);

  if (!product) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xl flex flex-col gap-md items-center justify-center text-center text-on-surface-variant min-h-[300px]">
        <span className="material-symbols-outlined text-[48px] text-outline-variant">
          medication
        </span>
        <div className="flex flex-col gap-xs">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Sin Producto Seleccionado
          </h2>
          <p className="font-body-sm text-body-sm">
            Busque y seleccione un producto farmacéutico del catálogo global para ver sus especificaciones y almacenamiento.
          </p>
        </div>
      </div>
    );
  }

  // Mapa de iconos para requerimientos de almacenamiento
  const getIconForReq = (req: string) => {
    const r = req.toLowerCase();
    if (r.includes("refriger") || r.includes("cold") || r.includes("2-8")) return "thermostat";
    if (r.includes("light") || r.includes("luz") || r.includes("sensit")) return "light_mode";
    if (r.includes("vault") || r.includes("lock") || r.includes("segur") || r.includes("control")) return "lock";
    if (r.includes("dry") || r.includes("seco")) return "water_drop";
    return "info";
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      {/* Product Image Area */}
      <div className="h-[180px] w-full bg-surface-container-high relative border-b border-outline-variant overflow-hidden group">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={product.name}
            src={product.image}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-90 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high gap-xs select-none">
            <span className="material-symbols-outlined text-[36px] text-on-secondary-container animate-pulse">
              pill
            </span>
            <span className="font-label-sm text-[11px] text-on-secondary-container">
              Imagen del Producto
            </span>
          </div>
        )}
        <div className="absolute top-sm right-sm">
          <span className="font-label-sm text-label-sm px-unit py-[2px] rounded bg-surface-container-lowest border border-outline-variant text-primary shadow-sm flex items-center gap-[2px] select-none font-semibold">
            <span className="material-symbols-outlined text-[12px] text-primary">
              verified
            </span>{" "}
            Autenticado
          </span>
        </div>
      </div>

      {/* Stats Content */}
      <div className="p-md flex flex-col gap-lg">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-[4px] leading-tight font-bold">
            {product.name}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
            {product.description}, NDC {product.ndc}
          </p>
        </div>

        {/* Location Data */}
        <div className="flex flex-col gap-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Ubicación Actual
          </span>
          <div className="flex items-center gap-sm bg-surface p-sm rounded border border-outline-variant">
            <span className="material-symbols-outlined text-outline text-[20px]">
              location_on
            </span>
            <div className="flex flex-col">
              <span className="font-body-md text-body-md font-semibold text-on-surface">
                {product.zone}
              </span>
              <span className="font-mono-table text-[11px] text-on-surface-variant">
                Estante {product.rack}, Fila {product.shelf}, Bin {product.bin}
              </span>
            </div>
          </div>
        </div>

        {/* Storage Requirements */}
        <div className="flex flex-col gap-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Requisitos de Almacenamiento
          </span>
          <div className="flex flex-wrap gap-xs">
            {product.requirements.map((req, idx) => (
              <span
                key={idx}
                className="font-label-sm text-label-sm px-[6px] py-[2px] rounded border border-outline-variant bg-surface-container text-on-surface flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {getIconForReq(req)}
                </span>
                {req}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
