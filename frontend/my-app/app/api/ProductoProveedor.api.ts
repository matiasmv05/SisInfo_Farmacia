// app/api/ProductoProveedor.api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("farmacia_token") ?? localStorage.getItem("farmacia_token"))
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ProductoProveedorDetalle {
  productoId: number;
  productoNombre: string;
  proveedorId: number;
  proveedorNombre: string;
  proveedorContacto: string | null;
  proveedorTelefono: string | null;
  esPrincipal: boolean;
  createdAt: string;
}

// POST /api/productos/{productoId}/proveedores
export async function asignarProveedorAProductoApi(
  productoId: number,
  proveedorId: number,
  esPrincipal: boolean = false
): Promise<ProductoProveedorDetalle> {
  const res = await fetch(`${BASE_URL}/api/productos/${productoId}/proveedores`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ proveedorId, esPrincipal }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// GET /api/productos/{productoId}/proveedores
export async function fetchProveedoresPorProductoApi(
  productoId: number
): Promise<ProductoProveedorDetalle[]> {
  const res = await fetch(`${BASE_URL}/api/productos/${productoId}/proveedores`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// PATCH /api/productos/{productoId}/proveedores/{proveedorId}/principal
export async function cambiarPrincipalApi(
  productoId: number,
  proveedorId: number
): Promise<ProductoProveedorDetalle> {
  const res = await fetch(
    `${BASE_URL}/api/productos/${productoId}/proveedores/${proveedorId}/principal`,
    { method: 'PATCH', headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// DELETE /api/productos/{productoId}/proveedores/{proveedorId}
export async function eliminarProveedorDeProductoApi(
  productoId: number,
  proveedorId: number
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/api/productos/${productoId}/proveedores/${proveedorId}`,
    { method: 'DELETE', headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}