// app/(dashboard)/layout.tsx
"use client";

import { useRequireAuth } from "../context/useRequireAuth";
import SideNavBar from "../components/SideNavBar";
import TopAppBar from "../components/TopAppBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Asegurar que el usuario esté logueado. Si no, redirige automáticamente a /login
  const { user, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-3">
          {/* Spinner moderno estilo glassmorphism / material design */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="font-body-md text-body-md text-on-surface-variant animate-pulse">
            Iniciando sesión segura...
          </span>
        </div>
      </div>
    );
  }

  // Evitar renderizado breve mientras se redirige
  if (!user) {
    return null;
  }

  return (
    <div className="bg-background text-on-background font-body-sm min-h-screen flex">
      {/* Barra de navegación lateral fija */}
      <SideNavBar />

      {/* Contenedor de contenido principal */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen relative">
        {/* Barra superior de la aplicación fija */}
        <TopAppBar />

        {/* Lienzo del contenido de la página */}
        <main className="flex-grow pt-[88px] px-10 pb-16 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
