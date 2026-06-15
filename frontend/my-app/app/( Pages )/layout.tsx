'use client';
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from '../components/layout/Sidebar';
import TopAppBar from '../components/layout/TopAppBar';
import { useAuth } from "../context/Authcontext";

const ADMIN_ONLY_ROUTES = [
  "/clasificacion-abc",
  "/proveedores",
  "/reportes",
  "/usuarios",
  "/inventario/crear",
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname  = usePathname();
  const router    = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.rol === "ADMINISTRADOR") return;

    const bloqueada = ADMIN_ONLY_ROUTES.some((ruta) =>
      pathname.startsWith(ruta)
    );

    if (bloqueada) {
      router.replace("/dashboard");
    }
  }, [pathname, user, router]);

  return (
    <>
      <Sidebar />
      <div className="ml-[260px] flex-1 flex flex-col h-screen overflow-hidden">
        <TopAppBar />
        <main className="flex-1 overflow-y-auto p-container_padding bg-background">
          {children}
        </main>
      </div>
    </>
  );
}