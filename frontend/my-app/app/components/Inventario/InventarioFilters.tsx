// app/components/InventarioFilters.tsx
"use client";

import React from "react";
import { useInventario } from "../../context/InventarioContext";
import { ClaseAbc, CategoriaProducto } from "../../types/Inventario.types";

const CATEGORIAS = [
  { value: "ANTIBIOTICOS", label: "Antibióticos" },
  { value: "ANTIHIPERTENSIVOS", label: "Antihipertensivos" },
  { value: "ANTIDIABETICOS", label: "Antidiabéticos" },
  { value: "ANALGESICOS", label: "Analgésicos" },
  { value: "ANTIINFLAMATORIOS", label: "Antiinflamatorios" },
  { value: "ANTIHISTAMINICOS", label: "Antihistamínicos" },
  { value: "ANTIGRIPALES", label: "Antigripales" },
  { value: "PROTECTORES_GASTRICOS", label: "Protectores Gástricos" },
  { value: "CARDIOLOGICOS", label: "Cardiológicos" },
  { value: "RESPIRATORIOS", label: "Respiratorios" },
  { value: "DERMATOLOGICOS", label: "Dermatológicos" },
  { value: "VITAMINAS_SUPLEMENTOS", label: "Vitaminas y Suplementos" },
  { value: "INSUMOS_MEDICOS", label: "Insumos Médicos" },
  { value: "CUIDADO_PERSONAL", label: "Cuidado Personal" },
  { value: "PEDIATRICO", label: "Pediátrico" },
  { value: "ORTOPEDIA", label: "Ortopedia" },
  { value: "OTROS", label: "Otros" },
];

export const InventarioFilters: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategoria,
    setSelectedCategoria,
    selectedClasificacionAbc,
    setSelectedClasificacionAbc,
  } = useInventario();

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
      {/* Buscador */}
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre, laboratorio o código..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none font-body-md text-body-md text-on-surface transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap md:flex-nowrap">
        {/* Selector de Categoría */}
        <div className="relative">
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value as CategoriaProducto | "")}
            className="appearance-none w-full md:w-48 pl-3 pr-8 py-2.5 bg-surface-container-low border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none font-body-md text-body-md text-on-surface transition-all cursor-pointer"
          >
            <option value="">Categoría</option>
            {CATEGORIAS.map((cat) => (
                 <option key={cat.value} value={cat.value}>
                 {cat.label}
                  </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Selector de Clase ABC */}
        <div className="relative">
          <select
            value={selectedClasificacionAbc}
            onChange={(e) =>
              setSelectedClasificacionAbc(e.target.value === "ALL" ? "" : e.target.value)
            }
            className="appearance-none w-full md:w-36 pl-3 pr-8 py-2.5 bg-surface-container-low border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none font-body-md text-body-md text-on-surface transition-all cursor-pointer"
          >
            <option value="ALL">Clase ABC</option>
            <option value="A">Clase A</option>
            <option value="B">Clase B</option>
            <option value="C">Clase C</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Botón de limpiar filtros — aparece si hay alguno activo */}
        {(selectedCategoria || selectedClasificacionAbc) && (
          <button
            onClick={() => {
              setSelectedCategoria("");
              setSelectedClasificacionAbc("");
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-primary border border-primary/30 bg-primary/5 rounded hover:bg-primary/10 transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[16px]">
              filter_alt_off
            </span>
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
};

export default InventarioFilters;