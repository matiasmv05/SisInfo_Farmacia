// app/components/dashboard/AbcDistribution.tsx
"use client";

import { DistribucionAbcItem } from "../../types/dashboard.types";

interface AbcDistributionProps {
  items: DistribucionAbcItem[];
  disponible: boolean;
}

const CLASS_STYLES: Record<string, { bg: string; text: string; bar: string }> = {
  A: { bg: "bg-primary",     text: "text-white", bar: "bg-primary" },
  B: { bg: "bg-[#0056B3]",   text: "text-white", bar: "bg-[#0056B3]" },
  C: { bg: "bg-outline",     text: "text-white", bar: "bg-outline" },
};

export default function AbcDistribution({
  items,
  disponible,
}: AbcDistributionProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-headline-sm font-headline-sm text-on-surface">
          Distribución ABC
        </h3>
        <span className="material-symbols-outlined text-on-surface-variant">
          pie_chart
        </span>
      </div>
      <p className="text-body-sm font-body-sm text-on-surface-variant mb-5">
        Valor del inventario según clasificación.
      </p>

      {!disponible ? (
        <div className="py-6 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[32px] opacity-40 block">
            analytics
          </span>
          <p className="text-body-sm mt-2">
            Sin datos — ejecuta el análisis ABC primero.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const styles = CLASS_STYLES[item.clase] ?? CLASS_STYLES.C;
            return (
              <div key={item.clase}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-sm ${styles.bg} ${styles.text} flex items-center justify-center font-bold text-xs`}
                    >
                      {item.clase}
                    </span>
                    <span className="text-body-sm font-medium text-on-surface">
                      {item.porcentajeInversion}% Inversión
                    </span>
                  </div>
                  <span className="text-body-sm font-data-mono text-on-surface-variant">
                    {item.porcentajeSkus}% SKUs
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5">
                  <div
                    className={`${styles.bar} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${item.porcentajeInversion}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}