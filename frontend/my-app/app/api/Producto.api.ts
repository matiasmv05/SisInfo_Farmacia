// app/api/Producto.api.ts

import { NuevoProductoPayload, ProductoCreado } from '../types/Producto.types';

/**
 * Simula la creación de un nuevo producto en el backend.
 * Cuando se conecte el backend real, reemplazar por una llamada fetch/axios.
 */
export async function createProductoApi(
  payload: NuevoProductoPayload
): Promise<ProductoCreado> {
  // Simular latencia de red (700ms)
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomId = Math.floor(Math.random() * 90000) + 10000;
      const producto: ProductoCreado = {
        ...payload,
        id: `PRD-${randomId}`,
        fechaCreacion: new Date().toISOString(),
      };
      resolve(producto);
    }, 700);
  });
}
