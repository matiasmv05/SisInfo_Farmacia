"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/Authcontext";
import { AuthUser } from "../types/Auth.types";

interface Options {
  /** Si se pasa, solo ese rol puede acceder. Sin valor = cualquier usuario autenticado. */
  rolRequerido?: AuthUser["rol"];
  /** Ruta a la que redirigir si no hay sesión (default: /login) */
  redirectTo?: string;
}

/**
 * Protege la página que lo usa.
 *
 * Uso:
 *   const { user } = useRequireAuth();
 *   const { user } = useRequireAuth({ rolRequerido: "ADMINISTRADOR" });
 */
export function useRequireAuth(options: Options = {}) {
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