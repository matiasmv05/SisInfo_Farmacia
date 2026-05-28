'use client';
// app/(Pages)/proveedores/crear/ProductoMultiSelect.tsx
//
// Combobox con búsqueda debounced que permite seleccionar múltiples productos.
// Muestra chips de los seleccionados con botón para remover.

import { useCallback, useEffect, useRef, useState } from 'react';
import { buscarProductosApi, ProductoResumen } from '../../api/Producto.api';

interface Props {
  seleccionados: ProductoResumen[];
  onChange: (productos: ProductoResumen[]) => void;
}

export default function ProductoMultiSelect({ seleccionados, onChange }: Props) {
  const [inputVal, setInputVal] = useState('');
  const [sugerencias, setSugerencias] = useState<ProductoResumen[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buscar = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSugerencias([]);
      setAbierto(false);
      return;
    }
    setBuscando(true);
    try {
      const resultados = await buscarProductosApi(query);
      // Filtrar los ya seleccionados
      const idsSeleccionados = new Set(seleccionados.map((p) => p.id));
      setSugerencias(resultados.filter((p) => !idsSeleccionados.has(p.id)));
      setAbierto(true);
    } catch {
      setSugerencias([]);
    } finally {
      setBuscando(false);
    }
  }, [seleccionados]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(val), 350);
  };

  const agregarProducto = (p: ProductoResumen) => {
    onChange([...seleccionados, p]);
    setInputVal('');
    setSugerencias([]);
    setAbierto(false);
  };

  const removerProducto = (id: number) => {
    onChange(seleccionados.filter((p) => p.id !== id));
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input con chips */}
      <div className="border border-outline-variant rounded bg-surface-container-lowest px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-shadow min-h-[42px]">
        {/* Chips de seleccionados */}
        {seleccionados.map((p) => (
          <span
            key={p.id}
            className="inline-flex items-center bg-secondary-container text-on-secondary-container text-body-sm font-body-sm px-2 py-0.5 rounded gap-1"
          >
            {p.nombre}
            <button
              type="button"
              onClick={() => removerProducto(p.id)}
              className="hover:text-error transition-colors"
              aria-label={`Remover ${p.nombre}`}
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>
        ))}

        {/* Input de búsqueda */}
        <input
          value={inputVal}
          onChange={handleInputChange}
          onFocus={() => inputVal && setAbierto(true)}
          placeholder={seleccionados.length === 0 ? 'Buscar producto por nombre…' : 'Añadir otro…'}
          className="flex-1 border-none bg-transparent focus:ring-0 p-0 text-body-md font-body-md min-w-[160px] outline-none text-on-surface placeholder:text-outline"
        />

        {/* Spinner */}
        {buscando && (
          <span className="material-symbols-outlined animate-spin text-primary text-[18px]">
            progress_activity
          </span>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {abierto && sugerencias.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-surface-container border border-outline-variant rounded shadow-lg max-h-52 overflow-y-auto">
          {sugerencias.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => agregarProducto(p)}
                className="w-full text-left px-4 py-2 hover:bg-surface-container-high transition-colors"
              >
                <span className="block font-body-sm text-body-sm text-on-surface font-medium">
                  {p.nombre}
                </span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">
                  {p.laboratorio} · {p.presentacion}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Sin resultados */}
      {abierto && !buscando && sugerencias.length === 0 && inputVal.trim() && (
        <div className="absolute z-20 mt-1 w-full bg-surface-container border border-outline-variant rounded shadow-lg px-4 py-3">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            No se encontraron productos para "{inputVal}"
          </span>
        </div>
      )}
    </div>
  );
}