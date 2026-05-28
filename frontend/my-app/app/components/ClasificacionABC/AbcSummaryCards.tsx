// app/components/AbcSummaryCards.tsx
"use client";

import React from "react";
import { useAbc } from "../../context/AbcContext";

export const AbcSummaryCards: React.FC = () => {
  const { summaries, selectedCategory, setSelectedCategory } = useAbc();

  // Mapeo de estilos visuales específicos por categoría
  const categoryStyles = {
    A: {
      colorText: "text-primary",
      colorTag: "bg-primary-container/20 text-primary border border-primary/10",
      colorProgress: "bg-primary",
      widthClass: "w-[80%]"
    },
    B: {
      colorText: "text-on-surface",
      colorTag: "bg-surface-container-high text-on-surface-variant border border-outline-variant",
      colorProgress: "bg-outline",
      widthClass: "w-[15%]"
    },
    C: {
      colorText: "text-outline",
      colorTag: "bg-surface-container-low text-outline border border-outline-variant/30",
      colorProgress: "bg-surface-variant",
      widthClass: "w-[5%]"
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {summaries.map((summary) => {
        const styles = categoryStyles[summary.categoria] || categoryStyles.A;
        const isSelected = selectedCategory === summary.categoria;

        return (
          <div
            key={summary.categoria}
            onClick={() => setSelectedCategory(isSelected ? "ALL" : summary.categoria)}
            className={`bg-surface-container-lowest border rounded-lg p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
              isSelected
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-outline-variant"
            }`}
          >
            {/* Cabecera */}
            <div className="flex justify-between items-start mb-4">
              <span className={`font-headline-sm text-headline-sm font-bold ${styles.colorText}`}>
                {summary.nombre}
              </span>
              <span className={`font-label-sm text-label-sm px-2 py-1 rounded ${styles.colorTag}`}>
                {summary.etiqueta}
              </span>
            </div>

            {/* Valor de Inventario */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Valor Inv.</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {summary.valorPorcentaje}%
                </span>
              </div>

              {/* Barra de Progreso */}
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${styles.colorProgress} h-full transition-all duration-500`}
                  style={{ width: `${summary.valorPorcentaje}%` }}
                ></div>
              </div>

              {/* Catálogo */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-surface-container-high">
                <span className="font-body-sm text-body-sm text-on-surface-variant">% Catálogo</span>
                <span className="font-body-md text-body-md font-medium text-on-surface">
                  {summary.catalogoPorcentaje}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default AbcSummaryCards;