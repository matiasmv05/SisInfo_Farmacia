import { LoginRequest, LoginResponse, ApiError } from "../types/Auth.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8082";

export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    let mensaje = "Error al iniciar sesión";
    try {
      const body = await res.json();
      mensaje = body.mensaje ?? body.message ?? mensaje;
    } catch {
      // respuesta sin body JSON — dejamos el mensaje por defecto
    }
    const error: ApiError = { mensaje, status: res.status };
    throw error;
  }

  return res.json() as Promise<LoginResponse>;
}