// app/components/ConfirmAction.tsx
"use client";

import React from "react";

interface ConfirmActionProps {
  onConfirm: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  text?: string;
  subtext?: string;
}

export function ConfirmAction({
  onConfirm,
  disabled = false,
  isLoading = false,
  text = "CONFIRMAR DESPACHO",
  subtext = "Presione Enter para confirmar rápido",
}: ConfirmActionProps) {
  return (
    <div className="pt-sm mt-auto w-full">
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={onConfirm}
        className={`w-full h-[48px] text-on-primary rounded font-label-md text-label-md flex items-center justify-center gap-sm transition-all duration-200 cursor-pointer shadow-md select-none ${
          disabled
            ? "bg-outline-variant/60 text-on-surface-variant/50 cursor-not-allowed shadow-none"
            : isLoading
            ? "bg-primary/95 opacity-80"
            : "bg-primary hover:bg-primary/90 active:scale-[0.99] hover:shadow-lg active:shadow-sm"
        }`}
      >
        {isLoading ? (
          <>
            <span className="material-symbols-outlined text-[18px] animate-spin">
              autorenew
            </span>
            PROCESANDO DESPACHO...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">
              check_circle
            </span>
            {text}
          </>
        )}
      </button>
      {subtext && !disabled && !isLoading && (
        <p className="font-label-sm text-label-sm text-center text-on-surface-variant mt-sm animate-pulse">
          {subtext}
        </p>
      )}
    </div>
  );
}
