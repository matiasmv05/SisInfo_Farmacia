// app/api/Reporte.api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8082';

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined'
      ? (sessionStorage.getItem('farmacia_token') ?? localStorage.getItem('farmacia_token'))
      : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ExportarReporteParams {
  tipo: string; // 'INVENTARIO', 'PERDIDAS', 'ALERTAS'
  fechaInicio?: string; // 'YYYY-MM-DD'
  fechaFin?: string; // 'YYYY-MM-DD'
}

export async function exportarReporteApi(params: ExportarReporteParams): Promise<{ success: true; blob: Blob } | { success: false; message: string }> {
  const { tipo, fechaInicio, fechaFin } = params;
  const query = new URLSearchParams();
  query.append('tipo', tipo);
  if (fechaInicio) query.append('fechaInicio', fechaInicio);
  if (fechaFin) query.append('fechaFin', fechaFin);

  try {
    const res = await fetch(`${BASE_URL}/api/reportes/exportar?${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const contentType = res.headers.get('content-type');

    if (res.ok && contentType && contentType.includes('application/pdf')) {
      const blob = await res.blob();
      return { success: true, blob };
    } else {
      // Intentar leer el JSON de error
      const errData = await res.json();
      return { success: false, message: errData.message ?? 'No se pudo generar el reporte.' };
    }
  } catch (error: any) {
    console.error('Error llamando a exportarReporteApi:', error);
    return { success: false, message: error.message ?? 'Error de conexión con el servidor.' };
  }
}
