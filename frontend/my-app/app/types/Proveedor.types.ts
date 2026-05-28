// app/types/Proveedor.types.ts

export interface ProveedorResponse {
  id: number;
  nombre: string;
  contactoNombre: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProveedorRequest {
  nombre: string;
  contactoNombre?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
}

// Formulario local (campos pueden estar vacíos mientras el usuario escribe)
export interface ProveedorForm {
  nombre: string;
  contactoNombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  activo: boolean;
}

export const proveedorFormInicial: ProveedorForm = {
  nombre: '',
  contactoNombre: '',
  telefono: '',
  correo: '',
  direccion: '',
  activo: true,
};