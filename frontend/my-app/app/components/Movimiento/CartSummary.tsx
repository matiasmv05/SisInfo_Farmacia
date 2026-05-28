import React from "react";

export interface CartItem {
  productoId: number;
  productoNombre: string;
  cantidad: number;
}

interface CartSummaryProps {
  items: CartItem[];
  onRemove: (productoId: number) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function CartSummary({
  items,
  onRemove,
  onConfirm,
  isSubmitting,
}: CartSummaryProps) {
  const totalUnits = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-outline-variant bg-surface flex justify-between items-center shrink-0">
        <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-outline">receipt_long</span>
          Resumen de Salida
        </h3>
        <span className="bg-surface-container text-on-surface-variant font-label-sm px-2.5 py-1 rounded">
          {items.length} {items.length === 1 ? "Ítem" : "Ítems"}
        </span>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">shopping_cart</span>
            <p className="text-body-md">Agregue productos a la lista</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr>
                  <th className="font-label-md text-on-surface-variant uppercase p-3 border-b border-outline-variant sticky top-0 bg-surface-container-lowest">Producto</th>
                  <th className="font-label-md text-on-surface-variant uppercase p-3 border-b border-outline-variant sticky top-0 bg-surface-container-lowest text-right">Cant.</th>
                  <th className="font-label-md text-on-surface-variant uppercase p-3 border-b border-outline-variant sticky top-0 bg-surface-container-lowest w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {items.map((item, idx) => (
                  <tr key={item.productoId} className="hover:bg-surface-container/30 transition-colors group">
                    <td className="p-3 font-medium text-on-surface">{item.productoNombre}</td>
                    <td className="p-3 text-right font-data-mono font-medium text-primary">{item.cantidad}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => onRemove(item.productoId)} className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-all p-1">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-outline-variant/40">
              {items.map((item) => (
                <div key={item.productoId} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-on-surface">{item.productoNombre}</p>
                    <p className="font-data-mono text-primary text-sm mt-0.5">{item.cantidad} uds</p>
                  </div>
                  <button onClick={() => onRemove(item.productoId)} className="text-outline hover:text-error p-1">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-outline-variant bg-surface shrink-0 space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-label-md text-on-surface-variant uppercase">Total Unidades</span>
          <span className="font-headline-sm text-on-surface">{totalUnits}</span>
        </div>
        <button
          onClick={onConfirm}
          disabled={items.length === 0 || isSubmitting}
          className="w-full py-3 bg-primary text-on-primary font-label-md uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          )}
          {isSubmitting ? "Procesando..." : "Confirmar Salida"}
        </button>
      </div>
    </div>
  );
}
