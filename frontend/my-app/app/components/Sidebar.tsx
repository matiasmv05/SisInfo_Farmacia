import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest border-r border-outline-variant flex flex-col z-30">
      <div className="flex flex-col h-full py-container_padding">
        <div className="px-4 mb-8">
          <h1 className="text-headline-sm font-headline-sm text-primary">F. Cristo Redentor</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Gestión Pro</p>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard" className="flex items-center gap-3 py-3 px-4 border-l-4 border-primary bg-primary-container/10 text-primary font-bold">
                <span className="material-symbols-outlined fill text-xl">dashboard</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 py-3 px-4 border-l-4 border-transparent text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150">
                <span className="material-symbols-outlined text-xl">inventory_2</span>
                <span>Inventario</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 py-3 px-4 border-l-4 border-transparent text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150">
                <span className="material-symbols-outlined text-xl">swap_horiz</span>
                <span>Movimientos</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 py-3 px-4 border-l-4 border-transparent text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150">
                <span className="material-symbols-outlined text-xl">analytics</span>
                <span>Clasificación ABC</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 py-3 px-4 border-l-4 border-transparent text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150">
                <span className="material-symbols-outlined text-xl">local_shipping</span>
                <span>Proveedores</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 py-3 px-4 border-l-4 border-transparent text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150">
                <span className="material-symbols-outlined text-xl">assessment</span>
                <span>Reportes</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 py-3 px-4 border-l-4 border-transparent text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150">
                <span className="material-symbols-outlined text-xl">settings</span>
                <span>Configuración</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-auto px-4 pt-4 border-t border-outline-variant">
          <Link href="#" className="flex items-center gap-3 py-3 px-4 text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 rounded">
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Cerrar Sesión</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
