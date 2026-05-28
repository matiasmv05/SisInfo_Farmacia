// app/services/Proveedor.service.ts
import { Proveedor } from "../types/Proveedor.types";

// Datos mock iniciales en memoria
const MOCK_PROVEEDORES: Proveedor[] = [
  {
    id: "PROV-001",
    razonSocial: "Droguería Nacional S.A.",
    laboratorios: ["Bayer", "Pfizer"],
    direccion: "San José, Costa Rica",
    nombreContacto: "Juan Pérez",
    telefono: "+506 8888-8888",
    email: "contacto@droguerianacional.com",
    activo: true,
  },
  {
    id: "PROV-002",
    razonSocial: "Corporación Médica del Sur",
    laboratorios: ["Roche", "Merck"],
    direccion: "Alajuela, Costa Rica",
    nombreContacto: "María Gómez",
    telefono: "+506 7777-7777",
    email: "mgomez@medsur.com",
    activo: true,
  },
];

export function getProveedores(): Proveedor[] {
  return [...MOCK_PROVEEDORES];
}

export function saveProveedor(proveedorData: Omit<Proveedor, "id">): Proveedor {
  const newId = `PROV-${String(MOCK_PROVEEDORES.length + 1).padStart(3, "0")}`;
  const newProveedor: Proveedor = {
    id: newId,
    ...proveedorData,
  };
  MOCK_PROVEEDORES.push(newProveedor);
  console.log("Proveedor guardado exitosamente:", newProveedor);
  return newProveedor;
}
