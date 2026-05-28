'use client';
// app/(Pages)/proveedores/crear/page.tsx

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ProductoResumen } from '../../../api/Producto.api';
import { asignarProveedorAProductoApi } from '../../../api/ProductoProveedor.api';
import { ProveedorProvider, useProveedorContext } from '../../../context/Proveedorcontext';
import { ProveedorForm, proveedorFormInicial } from '../../../types/Proveedor.types';
import ProductoMultiSelect from '../../../components/Proveedor/ProductoMultiSelect';

function CrearProveedorPageContent() {
  const router = useRouter();
  const { crearProveedor } = useProveedorContext();

  const [form, setForm] = useState<ProveedorForm>(proveedorFormInicial);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoResumen[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActivo = () => {
    setForm((prev) => ({ ...prev, activo: !prev.activo }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      const nuevoProveedor = await crearProveedor({
        nombre: form.nombre.trim(),
        contactoNombre: form.contactoNombre.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        correo: form.correo.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
      });

      if (productosSeleccionados.length > 0) {
        await Promise.allSettled(
          productosSeleccionados.map((p) =>
            asignarProveedorAProductoApi(p.id, nuevoProveedor.id, false)
          )
        );
      }

      router.push('/proveedores');
    } catch (err) {
      setError((err as Error).message);
      setGuardando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-[calc(100vh-80px)] p-6 items-center">
      <div className="w-full max-w-4xl">
        {/* Breadcrumbs & Header */}
        <div className="mb-6">
          <nav aria-label="Breadcrumb" className="flex text-on-surface-variant font-body-sm text-body-sm mb-2">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link className="hover:text-primary transition-colors" href="/proveedores">
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

        {/* Error global */}
        {error && (
          <div className="mb-4 p-3 rounded bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm w-full">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* Sección 1: Información General */}
            <section>
              <h3 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant pb-2 mb-4">
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="nombre">
                    Nombre o Razón Social <span className="text-error">*</span>
                  </label>
                  <input
                    id="nombre" name="nombre" type="text"
                    value={form.nombre} onChange={handleChange}
                    required maxLength={150}
                    placeholder="Ej. Droguería Nacional S.A."
                    className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2 transition-shadow"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface mb-1">
                    Productos asociados
                    <span className="ml-2 font-body-sm text-body-sm text-on-surface-variant font-normal">
                      (opcional — se pueden asignar después)
                    </span>
                  </label>
                  <ProductoMultiSelect
                    seleccionados={productosSeleccionados}
                    onChange={setProductosSeleccionados}
                  />
                  {productosSeleccionados.length > 0 && (
                    <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
                      {productosSeleccionados.length} producto
                      {productosSeleccionados.length > 1 ? 's' : ''} seleccionado
                      {productosSeleccionados.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="direccion">
                    Dirección Física
                  </label>
                  <textarea
                    id="direccion" name="direccion"
                    value={form.direccion} onChange={handleChange}
                    maxLength={250} rows={2}
                    placeholder="Dirección principal de la empresa"
                    className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2 transition-shadow"
                  />
                </div>
              </div>
            </section>

            {/* Sección 2: Datos de Contacto */}
            <section>
              <h3 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant pb-2 mb-4">
                Datos de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="contactoNombre">
                    Nombre del Contacto Principal
                  </label>
                  <input
                    id="contactoNombre" name="contactoNombre" type="text"
                    value={form.contactoNombre} onChange={handleChange}
                    maxLength={100} placeholder="Nombre completo"
                    className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2 transition-shadow"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="telefono">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant pointer-events-none">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </span>
                    <input
                      id="telefono" name="telefono" type="tel"
                      value={form.telefono} onChange={handleChange}
                      maxLength={30} placeholder="+591 7888-8888"
                      className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary pl-10 pr-3 py-2 transition-shadow"
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="correo">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant pointer-events-none">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </span>
                    <input
                      id="correo" name="correo" type="email"
                      value={form.correo} onChange={handleChange}
                      maxLength={100} placeholder="contacto@proveedor.com"
                      className="w-full border border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary pl-10 pr-3 py-2 transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 3: Estado */}
            <section>
              <h3 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant pb-2 mb-4">
                Estado del Proveedor
              </h3>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded border border-outline-variant">
                <div>
                  <span className="font-label-md text-label-md text-on-surface block">Proveedor Activo</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Permite crear nuevas órdenes de compra a este proveedor.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.activo} onChange={handleToggleActivo} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </section>

            {/* Botones */}
            <div className="pt-6 border-t border-outline-variant flex justify-end gap-4">
              <Link href="/proveedores">
                <button type="button" className="px-6 py-2 border border-primary text-primary font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                  Cancelar
                </button>
              </Link>
              <button
                type="submit" disabled={guardando}
                className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {guardando && (
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                )}
                {guardando ? 'Guardando…' : 'Guardar Proveedor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CrearProveedorPage() {
  return (
    <ProveedorProvider>
      <CrearProveedorPageContent />
    </ProveedorProvider>
  );
}