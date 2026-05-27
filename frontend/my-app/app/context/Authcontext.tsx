"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "../types/Auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser, remember: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "farmacia_token";
const USER_KEY  = "farmacia_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Rehidratar sesión al montar
  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
    const storedUser  = sessionStorage.getItem(USER_KEY)  ?? localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // datos corruptos — limpiar
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (newToken: string, newUser: AuthUser, remember: boolean) => {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, newToken);
      storage.setItem(USER_KEY, JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

// ─── AQUÍ AGREGAMOS EL HOOK QUE FALTABA ──────────────────────────────────────

interface RequireAuthOptions {
  /** Si se pasa, solo ese rol puede acceder. Sin valor = cualquier usuario autenticado. */
  rolRequerido?: AuthUser["rol"];
  /** Ruta a la que redirigir si no hay sesión (default: /login) */
  redirectTo?: string;
}

/**
 * Protege la página que lo usa.
 *
 * Uso:
 * const { user } = useRequireAuth();
 * const { user } = useRequireAuth({ rolRequerido: "ADMINISTRADOR" });
 */
export function useRequireAuth(options: RequireAuthOptions = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { rolRequerido, redirectTo = "/login" } = options;

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (rolRequerido && user.rol !== rolRequerido) {
      // Tiene sesión pero no el rol correcto — redirigir a su área
      router.replace(user.rol === "ADMINISTRADOR" ? "/dashboard" : "/inventario");
    }
  }, [user, isLoading, rolRequerido, redirectTo, router]);

  return { user, isLoading };
}