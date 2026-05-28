// app/(dashboard)/inventario/nuevo/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { NuevoProductoProvider } from '../../../context/NuevoProductoContext';
import NuevoProductoForm from '../../../components/Inventario/crear/NuevoProductoForm';

export default function NuevoProductoPage() {
  return (
    <NuevoProductoProvider>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb / Navegación de retorno */}
        <div className="flex items-center gap-2">
          <Link
            href="/inventario"
            className="text-primary hover:underline font-label-md text-label-md flex items-center gap-1 transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Volver a Inventario
          </Link>
        </div>

        {/* Formulario principal */}
        <NuevoProductoForm />
      </div>
    </NuevoProductoProvider>
  );
}