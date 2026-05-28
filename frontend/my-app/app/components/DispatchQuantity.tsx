// app/components/DispatchQuantity.tsx
"use client";

import React from "react";

interface DispatchQuantityProps {
  quantity: number;
  maxQuantity: number;
  unitLabel?: string;
  onChangeQuantity: (quantity: number) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function DispatchQuantity({
  quantity,
  maxQuantity,
  unitLabel = "Unidades (Viales)",
  onChangeQuantity,
  inputRef,
  onKeyDown,
}: DispatchQuantityProps) {
  const isInvalid = quantity > maxQuantity || quantity < 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      onChangeQuantity(0);
    } else {
      onChangeQuantity(value);
    }
  };

  return (
    <div className="flex flex-col gap-xs">
      <label className="font-label-md text-label-md text-on-surface">
        Cantidad a Despachar
      </label>
      <div className="flex items-center gap-sm">
        <input
          ref={inputRef}
          type="number"
          min="1"
          max={maxQuantity}
          value={quantity === 0 ? "" : quantity}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          className={`w-[120px] h-[48px] px-md border rounded font-mono-table text-[18px] font-semibold outline-none text-right bg-surface-bright focus:ring-1 transition-all ${
            isInvalid
              ? "border-error ring-1 ring-error text-error focus:border-error focus:ring-error"
              : "border-outline-variant text-on-surface focus:border-primary focus:ring-primary"
          }`}
        />
        <div className="flex flex-col">
          <span className="font-body-md text-body-md text-on-surface-variant">
            {unitLabel}
          </span>
          {isInvalid && (
            <span className="text-[11px] text-error font-medium animate-bounce mt-[2px]">
              {quantity > maxQuantity
                ? `Máx: ${maxQuantity.toLocaleString()}`
                : "Mínimo: 1"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
