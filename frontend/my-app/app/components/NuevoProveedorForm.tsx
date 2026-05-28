// app/components/NuevoProveedorForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProveedor } from "../services/Proveedor.service";

export const NuevoProveedorForm: React.FC = () => {
  const router = useRouter();

  // Estados del formulario
  const [razonSocial, setRazonSocial] = useState("");
  const [laboratorioInput, setLaboratorioInput] = useState("");
  const [laboratorios, setLaboratorios] = useState<string[]>(["Bayer", "Pfizer"]);
  const [direccion, setDireccion] = useState("");
  const [nombreContacto, setNombreContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [activo, setActivo] = useState(true);

  // Mensaje de éxito/error local
  const [isSuccess, setIsSuccess] = useState(false);

  // Manejador para agregar laboratorio
  const handleAddLaboratorio = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = laboratorioInput.trim().replace(/,$/, "");
      if (tag && !laboratorios.includes(tag)) {
        setLaboratorios([...laboratorios, tag]);
      }
      setLaboratorioInput("");
    }
  };

  // Manejador para quitar laboratorio
  const handleRemoveLaboratorio = (indexToRemove: number) => {
    setLaboratorios(laboratorios.filter((_, index) => index !== indexToRemove));
  };

  // Enviar el formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!razonSocial || !telefono || !email) {
      alert("Por favor, complete los campos obligatorios (*)");
      return;
    }

    saveProveedor({
      razonSocial,
      laboratorios,
      direccion,
      nombreContacto,
      telefono,
      email,
      activo,
    });

    setIsSuccess(true);
    setTimeout(() => {
      // Redirigir o limpiar
      router.push("/proveedores");
    }, 1500);
  };

  const handleCancel = () => {
    router.push("/proveedores");
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg max-w-4xl shadow-sm">
      {isSuccess ? (
        <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
          <span className="material-symbols-outlined text-[64px] text-secondary">
            check_circle
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Proveedor Guardado
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            El proveedor se ha registrado exitosamente. Redirigiendo...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Section 1: Información General */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant pb-2 mb-4">
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre o Razón Social */}
              <div className="col-span-1 md:col-span-2">
                <label
                  className="block font-label-md text-label-md text-on-surface mb-1"
                  htmlFor="razon_social"
                >
                  Nombre o Razón Social <span className="text-error">*</span>
                </label>
                <input
                  className="w-full border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2 transition-shadow"
                  id="razon_social"
                  name="razon_social"
                  placeholder="Ej. Droguería Nacional S.A."
                  required
                  type="text"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                />
              </div>

              {/* Laboratorios que suministra */}
              <div className="col-span-1 md:col-span-2">
                <label
                  className="block font-label-md text-label-md text-on-surface mb-1"
                  htmlFor="laboratorios"
                >
                  Laboratorios que suministra
                </label>
                <div className="border border-outline-variant rounded bg-surface-container-lowest px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-shadow">
                  {laboratorios.map((lab, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-surface-container-high text-on-surface text-body-sm font-body-sm px-2 py-1 rounded"
                    >
                      {lab}
                      <button
                        className="ml-1 text-on-surface-variant hover:text-error flex items-center justify-center"
                        type="button"
                        onClick={() => handleRemoveLaboratorio(index)}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </span>
                  ))}
                  <input
                    className="flex-1 border-none bg-transparent focus:ring-0 p-0 text-body-md font-body-md min-w-[150px] outline-none"
                    id="laboratorios"
                    name="laboratorios"
                    placeholder="Escribe y presiona Enter..."
                    type="text"
                    value={laboratorioInput}
                    onChange={(e) => setLaboratorioInput(e.target.value)}
                    onKeyDown={handleAddLaboratorio}
                  />
                </div>
              </div>

              {/* Dirección Física */}
              <div className="col-span-1 md:col-span-2">
                <label
                  className="block font-label-md text-label-md text-on-surface mb-1"
                  htmlFor="direccion"
                >
                  Dirección Física
                </label>
                <textarea
                  className="w-full border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2 transition-shadow"
                  id="direccion"
                  name="direccion"
                  placeholder="Dirección principal de la empresa"
                  rows={2}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Datos de Contacto */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant pb-2 mb-4">
              Datos de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre del Contacto */}
              <div className="col-span-1 md:col-span-2">
                <label
                  className="block font-label-md text-label-md text-on-surface mb-1"
                  htmlFor="nombre_contacto"
                >
                  Nombre del Contacto Principal
                </label>
                <input
                  className="w-full border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2 transition-shadow"
                  id="nombre_contacto"
                  name="nombre_contacto"
                  placeholder="Nombre completo"
                  type="text"
                  value={nombreContacto}
                  onChange={(e) => setNombreContacto(e.target.value)}
                />
              </div>

              {/* Teléfono/WhatsApp */}
              <div className="col-span-1">
                <label
                  className="block font-label-md text-label-md text-on-surface mb-1"
                  htmlFor="telefono"
                >
                  Teléfono / WhatsApp <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">
                      call
                    </span>
                  </span>
                  <input
                    className="w-full border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary pl-10 pr-3 py-2 transition-shadow"
                    id="telefono"
                    name="telefono"
                    placeholder="+506 8888-8888"
                    required
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="col-span-1">
                <label
                  className="block font-label-md text-label-md text-on-surface mb-1"
                  htmlFor="email"
                >
                  Correo Electrónico <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">
                      mail
                    </span>
                  </span>
                  <input
                    className="w-full border-outline-variant rounded bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary pl-10 pr-3 py-2 transition-shadow"
                    id="email"
                    name="email"
                    placeholder="contacto@proveedor.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Estado del Proveedor */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant pb-2 mb-4">
              Estado del Proveedor
            </h3>
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded border border-outline-variant">
              <div>
                <span className="font-label-md text-label-md text-on-surface block">
                  Proveedor Activo
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Permite crear nuevas órdenes de compra a este proveedor.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-outline-variant flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-primary text-primary font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors bg-surface-container-lowest"
              type="button"
            >
              Cancelar
            </button>
            <button
              className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary-container transition-colors"
              type="submit"
            >
              Guardar Proveedor
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
