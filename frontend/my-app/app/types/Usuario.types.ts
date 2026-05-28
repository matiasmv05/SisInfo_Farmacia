// app/types/Usuario.types.ts

/** Respuesta del backend: GET /api/usuarios y GET /api/usuarios/{id} */
export interface UsuarioResponse {
  id: number;
  nombreCompleto: string;
  telefono: string | null;
  email: string;
  rol: 'ADMINISTRADOR' | 'OPERADOR';
  activo: boolean;
}

/** Body para POST /api/usuarios */
export interface CrearUsuarioRequest {
  nombreCompleto: string;
  passwordHash: string;
  rol: 'ADMINISTRADOR' | 'OPERADOR';
  telefono?: string;
  email: string;
}

/** Body para PUT /api/usuarios/{id} */
export interface ActualizarUsuarioRequest {
  nombreCompleto?: string;
  passwordHash?: string;
  telefono?: string;
  email?: string;
}

/** Formulario local (usado en modales de crear / editar) */
export interface UsuarioForm {
  nombreCompleto: string;
  email: string;
  telefono: string;
  rol: 'ADMINISTRADOR' | 'OPERADOR';
  password: string;
  confirmarPassword: string;
}

export const usuarioFormInicial: UsuarioForm = {
  nombreCompleto: '',
  email: '',
  telefono: '',
  rol: 'OPERADOR',
  password: '',
  confirmarPassword: '',
};
