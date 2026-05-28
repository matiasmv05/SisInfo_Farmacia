// app/components/SuccessModal.tsx
"use client";

import React from "react";
import { DispatchTransaction } from "../types/Dispatch.types";

interface SuccessModalProps {
  isOpen: boolean;
  transaction: DispatchTransaction | null;
  onClose: () => void;
}

export function SuccessModal({ isOpen, transaction, onClose }: SuccessModalProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-md z-50 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg max-w-[480px] w-full p-xl flex flex-col gap-lg shadow-2xl animate-in scale-in-95 duration-200">
        
        {/* Celebration Header */}
        <div className="flex flex-col items-center text-center gap-sm">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-primary flex items-center justify-center animate-bounce">
            <span className="material-symbols-outlined text-[28px] font-bold">
              check_circle
            </span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Despacho Exitoso
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-[2px]">
              Transacción registrada en el manifiesto oficial de salida.
            </p>
          </div>
        </div>

        {/* Receipt/Transaction Details Card */}
        <div className="bg-surface-container-low border border-outline-variant rounded p-md flex flex-col gap-sm">
          <div className="flex items-center justify-between border-b border-outline-variant pb-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
              Detalle
            </span>
            <span className="font-mono-table text-mono-table text-primary font-bold">
              {transaction.id}
            </span>
          </div>
          
          <div className="flex flex-col gap-xs py-[2px]">
            <div className="flex justify-between items-start text-body-sm">
              <span className="text-on-surface-variant font-medium">Producto:</span>
              <span className="text-on-surface text-right font-semibold max-w-[240px] truncate">
                {transaction.productName}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">Lote Utilizado:</span>
              <span className="font-mono-table text-on-surface font-semibold">
                {transaction.lotNumber}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">Cantidad Despachada:</span>
              <span className="font-mono-table text-[15px] font-bold text-on-surface">
                {transaction.quantity.toLocaleString()} Unidades
              </span>
            </div>

            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">Fecha/Hora:</span>
              <span className="text-on-surface font-medium text-right">
                {new Date(transaction.timestamp).toLocaleDateString()} {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {transaction.witnessName && (
              <div className="flex justify-between items-center text-body-sm border-t border-outline-variant/60 pt-sm mt-xs">
                <span className="text-error font-semibold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">
                    verified_user
                  </span>
                  Testigo Firmante:
                </span>
                <span className="text-on-surface font-semibold text-right italic">
                  {transaction.witnessName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <button
          onClick={onClose}
          className="w-full h-[44px] bg-primary text-on-primary rounded font-label-md text-label-md flex items-center justify-center gap-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[16px]">
            add_circle
          </span>
          NUEVO DESPACHO
        </button>
      </div>
    </div>
  );
}
