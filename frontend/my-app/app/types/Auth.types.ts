export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  id: number;
  username: string;
  nombreCompleto: string;
  rol: "ADMINISTRADOR" | "OPERADOR";
}

export interface AuthUser {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: "ADMINISTRADOR" | "OPERADOR";
}

export interface ApiError {
  mensaje: string;
  status: number;
}