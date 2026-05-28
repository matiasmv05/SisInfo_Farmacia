// app/components/ProductSearch.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product } from "../types/Dispatch.types";
import { dispatchService } from "../services/dispatch.service";

interface ProductSearchProps {
  initialValue?: string;
  onSelectProduct: (product: Product) => void;
  onSearchSubmit?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function ProductSearch({
  initialValue = "",
  onSelectProduct,
  onSearchSubmit,
  inputRef,
}: ProductSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar sugerencias cuando cambie la consulta
  useEffect(() => {
    if (query.trim().length > 1) {
      const results = dispatchService.searchProducts(query);
      setSuggestions(results);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  // Manejar click fuera para cerrar dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (product: Product) => {
    setQuery(product.name);
    setSuggestions([]);
    setIsOpen(false);
    onSelectProduct(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Si hay sugerencias y el dropdown está abierto, seleccionamos la primera
      if (isOpen && suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
      if (onSearchSubmit) {
        onSearchSubmit();
      }
    }
  };

  // Simulación de escáner de código de barras
  const handleBarcodeClick = () => {
    // Simulamos que escanea Amoxicilina
    const amoxi = dispatchService.getProducts().find(p => p.id === "prod-004");
    if (amoxi) {
      handleSelect(amoxi);
      alert("Simulación de Código de Barras: Se ha escaneado Amoxicilina 500mg (NDC 0093-3107-05)");
    }
  };

  return (
    <div className="flex flex-col gap-xs relative" ref={dropdownRef}>
      <label className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          search
        </span>
        Búsqueda Global de Productos
      </label>
      <div className="relative flex items-center w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 1) setIsOpen(true);
          }}
          className="w-full h-[36px] pl-sm pr-[36px] border border-primary ring-1 ring-primary rounded font-body-md text-body-md text-on-surface outline-none bg-surface-bright focus:border-black focus:ring-black transition-all"
          placeholder="Escanee código de barras o escriba nomenclatura..."
          autoFocus
        />
        <button
          type="button"
          onClick={handleBarcodeClick}
          className="absolute right-sm flex items-center justify-center text-outline-variant hover:text-primary transition-colors text-[18px] cursor-pointer"
          title="Simular Escanear Código"
        >
          <span className="material-symbols-outlined text-[20px]">
            barcode_scanner
          </span>
        </button>
      </div>

      {/* Autocomplete Dropdown Premium */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-[68px] left-0 w-full bg-surface-container-lowest border border-outline-variant rounded shadow-xl z-50 overflow-hidden max-h-[220px] transition-all animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-sm py-xs bg-surface-container-low border-b border-outline-variant">
            <span className="font-label-sm text-label-sm text-on-secondary-container tracking-wider uppercase">
              Resultados Sugeridos
            </span>
          </div>
          <ul className="divide-y divide-outline-variant/30">
            {suggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => handleSelect(product)}
                className="px-sm py-sm hover:bg-secondary-container/30 cursor-pointer flex justify-between items-center transition-colors group"
              >
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-medium text-on-surface group-hover:text-primary">
                    {product.name}
                  </span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">
                    {product.description} • NDC {product.ndc}
                  </span>
                </div>
                <span className="font-label-sm text-[11px] px-sm py-[2px] rounded border border-outline-variant bg-surface-container text-on-surface group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  {product.zone.split("•")[0].trim()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
