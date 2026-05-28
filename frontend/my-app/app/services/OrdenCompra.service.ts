// app/services/OrdenCompra.service.ts
import { EstadoOrden, OrdenCompra, OrdenCompraFiltersState } from "../types/OrdenCompra.types";

// ─── Datos mock (reemplazar con llamadas al backend) ─────────────────────────
const MOCK_ORDENES: OrdenCompra[] = [
  { id: "OC-2023-1042", fecha: "2023-10-12", proveedor: "Pfizer Pharmaceuticals", total: 12450.0,  estado: "received" },
  { id: "OC-2023-1043", fecha: "2023-10-14", proveedor: "Bayer AG",               total: 4200.5,   estado: "issued"   },
  { id: "OC-2023-1044", fecha: "2023-10-15", proveedor: "Laboratorios Bago",      total: 890.0,    estado: "draft"    },
  { id: "OC-2023-1045", fecha: "2023-10-16", proveedor: "Medtronic PLC",          total: 25600.0,  estado: "canceled" },
  { id: "OC-2023-1046", fecha: "2023-10-18", proveedor: "Johnson & Johnson",      total: 5120.75,  estado: "issued"   },
  { id: "OC-2023-1047", fecha: "2023-10-20", proveedor: "Roche Holding",          total: 8750.0,   estado: "received" },
  { id: "OC-2023-1048", fecha: "2023-10-22", proveedor: "Abbott Laboratories",    total: 3300.25,  estado: "draft"    },
  { id: "OC-2023-1049", fecha: "2023-10-23", proveedor: "Novartis AG",            total: 14900.0,  estado: "issued"   },
  { id: "OC-2023-1050", fecha: "2023-10-25", proveedor: "Sanofi S.A.",            total: 6780.5,   estado: "canceled" },
  { id: "OC-2023-1051", fecha: "2023-10-27", proveedor: "GlaxoSmithKline",        total: 2100.0,   estado: "received" },
  { id: "OC-2023-1052", fecha: "2023-10-28", proveedor: "AstraZeneca",            total: 19500.0,  estado: "issued"   },
  { id: "OC-2023-1053", fecha: "2023-10-29", proveedor: "Merck & Co.",            total: 7620.75,  estado: "draft"    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// ─── Servicio principal ───────────────────────────────────────────────────────
export interface GetOrdenesResult {
  data: OrdenCompra[];
  total: number;
}

export function getOrdenesCompra(
  filters: OrdenCompraFiltersState,
  page: number,
  pageSize: number
): GetOrdenesResult {
  let filtered = [...MOCK_ORDENES];

  if (filters.busqueda.trim()) {
    const q = filters.busqueda.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.proveedor.toLowerCase().includes(q)
    );
  }

  if (filters.estado) {
    filtered = filtered.filter((o) => o.estado === filters.estado);
  }

  if (filters.fechaDesde) {
    const desde = new Date(filters.fechaDesde);
    filtered = filtered.filter((o) => new Date(o.fecha) >= desde);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total };
}

export function deleteOrdenCompra(id: string): boolean {
  const idx = MOCK_ORDENES.findIndex((o) => o.id === id);
  if (idx !== -1) {
    MOCK_ORDENES.splice(idx, 1);
    return true;
  }
  return false;
}

// Mapeo de estados a etiquetas en español
export const ESTADO_LABELS: Record<EstadoOrden, string> = {
  draft:    "Borrador",
  issued:   "Emitida",
  received: "Recibida",
  canceled: "Cancelada",
};
