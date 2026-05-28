// app/types/Proveedor.types.ts

export interface Proveedor {
  id: string;
  razonSocial: string;
  laboratorios: string[];
  direccion: string;
  nombreContacto: string;
  telefono: string;
  email: string;
  activo: boolean;
}
