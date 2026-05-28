"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchProductosApi } from "../../api/Producto.api";

interface ProductoResumen {
  id: number;
  nombre: string;
  laboratorio: string;
  stockTotal: number;
  categoria: string;
  presentacion: string;
}

interface ProductSearchProps {
  onSelect: (p: ProductoResumen) => void;
}

export default function ProductSearch({ onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductoResumen[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setShowDropdown(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetchProductosApi({ page: 0, limit: 8, nombre: query });
        setResults(res.data as ProductoResumen[]);
        setShowDropdown(true);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
        Buscar Producto
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
          {searching ? "progress_activity" : "search"}
        </span>
        <input
          type="text"
          placeholder="Nombre, código o principio activo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setQuery(p.nombre); setShowDropdown(false); }}
              className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors flex justify-between items-center gap-2"
            >
              <div>
                <p className="font-medium text-on-surface">{p.nombre}</p>
                <p className="text-[11px] text-on-surface-variant">{p.laboratorio} · {p.presentacion}</p>
              </div>
              <span className="text-label-sm text-primary font-data-mono whitespace-nowrap">
                Stock: {p.stockTotal}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
