// app/components/ParetoChart.tsx
"use client";

import React, { useMemo } from "react";
import { useAbc } from "../context/AbcContext";

export const ParetoChart: React.FC = () => {
  const { allItems } = useAbc();

  // Tomar los 6 SKUs de mayor valor para el gráfico
  const topItems = useMemo(() => {
    return allItems.slice(0, 6);
  }, [allItems]);

  // Encontrar el valor máximo entre los 6 principales para escalar el gráfico de barras
  const maxValue = useMemo(() => {
    if (topItems.length === 0) return 1;
    return Math.max(...topItems.map((item) => item.valor));
  }, [topItems]);

  // Generar la cadena de puntos para la polilínea del gráfico SVG
  // El SVG tiene una cuadrícula interna de viewBox="0 0 600 150"
  // Eje X: 6 barras espaciadas uniformemente
  // Eje Y: Porcentaje acumulado (0% en Y=150, 100% en Y=10)
  const svgPoints = useMemo(() => {
    if (topItems.length === 0) return "0,150";

    const points: string[] = [];
    // Punto de partida inicial en la esquina inferior izquierda
    points.push("0,150");

    const segmentWidth = 600 / topItems.length;
    topItems.forEach((item, index) => {
      // Centrar el punto del SVG en medio de la barra
      const x = Math.round((index + 0.5) * segmentWidth);
      // Invertir el eje Y (0% acumulado es Y=150, 100% acumulado es Y=10)
      const y = Math.round(150 - (item.porcentajeAcumulado / 100) * 140);
      points.push(`${x},${y}`);
    });

    // Punto final en el 100% a la derecha
    points.push(`600,${Math.round(150 - (topItems[topItems.length - 1]?.porcentajeAcumulado / 100) * 140)}`);

    return points.join(" ");
  }, [topItems]);

  const getBarColor = (clasificacion: string) => {
    switch (clasificacion) {
      case "A":
        return "bg-primary/80 hover:bg-primary transition-colors";
      case "B":
        return "bg-outline/50 hover:bg-outline transition-colors";
      default:
        return "bg-surface-variant hover:bg-outline-variant transition-colors";
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-label-md text-label-md text-on-surface-variant">
          Curva de Pareto (Valor Acumulado)
        </h3>
        <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
          Top 6 SKUs
        </span>
      </div>

      <div className="flex-1 relative min-h-[190px] flex items-end gap-2 px-2 mt-2">
        {/* Simulación dinámica de gráfico de barras */}
        {topItems.map((item, idx) => {
          // El porcentaje de altura de la barra es relativo al elemento más costoso
          const heightPercent = maxValue > 0 ? (item.valor / maxValue) * 100 : 0;

          return (
            <div
              key={item.codigo}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              {/* Tooltip moderno de Material Design al hacer hover */}
              <div className="absolute bottom-full mb-2 bg-inverse-surface text-inverse-on-surface text-label-sm rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 shadow-sm w-max max-w-[150px]">
                <p className="font-bold">{item.codigo}</p>
                <p className="text-[11px] truncate">{item.articulo}</p>
                <p className="text-primary-fixed mt-1">Val: ${item.valor.toLocaleString()}</p>
                <p className="text-secondary-fixed-dim">Acum: {item.porcentajeAcumulado}%</p>
              </div>

              {/* Barra */}
              <div
                className={`w-full rounded-t-sm ${getBarColor(item.clasificacion)}`}
                style={{ height: `${Math.max(5, heightPercent)}%`, transition: "height 0.5s ease-out" }}
              ></div>

              {/* Etiqueta de la barra */}
              <span className="text-[9px] text-on-surface-variant font-data-mono mt-1 opacity-70 group-hover:opacity-100 truncate w-full text-center">
                {item.codigo}
              </span>
            </div>
          );
        })}

        {/* Línea simulada de Pareto dinámica */}
        {topItems.length > 0 && (
          <svg
            className="absolute inset-x-0 bottom-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 600 150"
            preserveAspectRatio="none"
          >
            {/* Sombra de área debajo de la curva para un look premium */}
            <path
              d={`M0,150 ${svgPoints.replace("0,150", "")} L600,150 Z`}
              fill="url(#pareto-gradient)"
              opacity="0.08"
              className="transition-all duration-500"
            />
            {/* La curva */}
            <polyline
              fill="none"
              points={svgPoints}
              stroke="#003f87"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-500"
              strokeDasharray="4 2"
            />
            {/* Puntos individuales en los cruces */}
            {topItems.map((item, index) => {
              const segmentWidth = 600 / topItems.length;
              const cx = Math.round((index + 0.5) * segmentWidth);
              const cy = Math.round(150 - (item.porcentajeAcumulado / 100) * 140);
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#ffffff"
                  stroke="#003f87"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
              );
            })}

            {/* Definición del degradado del gráfico */}
            <defs>
              <linearGradient id="pareto-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#003f87" />
                <stop offset="100%" stopColor="#003f87" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
    </div>
  );
};
export default ParetoChart;
