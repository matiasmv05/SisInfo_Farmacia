// app/components/ClasificacionABC/ParetoChart.tsx
"use client";

import React, { useMemo } from "react";
import { useAbc } from "../../context/AbcContext";

export const ParetoChart: React.FC = () => {
  const { allItems } = useAbc();

  // Top 8 SKUs por valor de rotación (ya vienen ordenados del backend)
  const topItems = useMemo(() => allItems.slice(0, 8), [allItems]);

  const maxValue = useMemo(
    () => (topItems.length === 0 ? 1 : Math.max(...topItems.map((i) => i.valor))),
    [topItems]
  );

  // Polilínea SVG para la curva de Pareto acumulada
  // ViewBox 600×150 — Y=150 es 0%, Y=10 es 100%
  const svgPoints = useMemo(() => {
    if (topItems.length === 0) return "0,150";

    const segW = 600 / topItems.length;
    const pts: string[] = ["0,150"];

    topItems.forEach((item, i) => {
      const x = Math.round((i + 0.5) * segW);
      const y = Math.round(150 - (item.porcentajeAcumulado / 100) * 140);
      pts.push(`${x},${y}`);
    });

    const lastY = Math.round(
      150 - (topItems[topItems.length - 1].porcentajeAcumulado / 100) * 140
    );
    pts.push(`600,${lastY}`);

    return pts.join(" ");
  }, [topItems]);

  const getBarColor = (clasificacion: string) => {
    switch (clasificacion) {
      case "A":
        return "bg-primary/80 hover:bg-primary";
      case "B":
        return "bg-outline/50 hover:bg-outline";
      default:
        return "bg-surface-variant hover:bg-outline-variant";
    }
  };

  if (topItems.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex items-center justify-center min-h-[190px]">
        <p className="text-on-surface-variant text-body-sm">Sin datos para graficar</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-label-md text-label-md text-on-surface-variant">
          Curva de Pareto (Valor Acumulado)
        </h3>
        <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
          Top {topItems.length} SKUs
        </span>
      </div>

      <div className="flex-1 relative min-h-[190px] flex items-end gap-1.5 px-2 mt-2">
        {topItems.map((item, idx) => {
          const heightPercent =
            maxValue > 0 ? (item.valor / maxValue) * 100 : 0;

          return (
            <div
              key={item.productoId}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              {/* Tooltip al hover */}
              <div className="absolute bottom-full mb-2 bg-inverse-surface text-inverse-on-surface text-label-sm rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 shadow-sm w-max max-w-[160px]">
                <p className="font-bold">{item.codigo}</p>
                <p className="text-[11px] truncate">{item.articulo}</p>
                <p className="text-[11px] truncate text-on-surface-variant/70">
                  {item.laboratorio}
                </p>
                <p className="text-primary-fixed mt-1">
                  Val:{" "}
                  {item.valor.toLocaleString("es-BO", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-secondary-fixed-dim">
                  Acum: {item.porcentajeAcumulado.toFixed(1)}%
                </p>
              </div>

              {/* Barra */}
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${getBarColor(item.clasificacion)}`}
                style={{ height: `${Math.max(4, heightPercent)}%` }}
              />

              {/* Etiqueta */}
              <span className="text-[9px] text-on-surface-variant font-data-mono mt-1 opacity-70 group-hover:opacity-100 truncate w-full text-center">
                {item.codigo.replace("P-", "")}
              </span>
            </div>
          );
        })}

        {/* Curva de Pareto SVG */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 600 150"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pareto-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#003f87" />
              <stop offset="100%" stopColor="#003f87" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Área bajo la curva */}
          <path
            d={`M0,150 ${svgPoints.replace("0,150 ", "")} L600,150 Z`}
            fill="url(#pareto-gradient)"
            opacity="0.08"
          />

          {/* Línea */}
          <polyline
            fill="none"
            points={svgPoints}
            stroke="#003f87"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="4 2"
          />

          {/* Puntos */}
          {topItems.map((item, i) => {
            const segW = 600 / topItems.length;
            const cx = Math.round((i + 0.5) * segW);
            const cy = Math.round(150 - (item.porcentajeAcumulado / 100) * 140);
            return (
              <circle
                key={item.productoId}
                cx={cx}
                cy={cy}
                r="4"
                fill="#ffffff"
                stroke="#003f87"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ParetoChart;