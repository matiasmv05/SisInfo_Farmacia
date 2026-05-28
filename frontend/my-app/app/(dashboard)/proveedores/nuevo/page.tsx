// app/(dashboard)/proveedores/nuevo/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { NuevoProveedorForm } from "../../../components/NuevoProveedorForm";

export default function NuevoProveedorPage() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="flex text-on-surface-variant font-body-sm text-body-sm mb-2">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/proveedores" className="hover:text-primary transition-colors">
                Proveedores
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                <span className="text-primary font-medium">Nuevo Proveedor</span>
              </div>
            </li>
          </ol>
        </nav>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          Añadir Nuevo Proveedor
        </h2>
      </div>

      {/* Formulario */}
      <NuevoProveedorForm />
    </div>
  );
}
