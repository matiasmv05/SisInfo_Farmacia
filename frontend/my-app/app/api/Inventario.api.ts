// app/api/Inventario.api.ts

import { InventarioItem } from "../types/Inventario.types";

const MOCK_INVENTARIO: InventarioItem[] = [
  { codigo: "MED-001", nombre: "Amoxicilina 500mg", categoria: "Antibióticos", laboratorio: "Bayer", stock: 12, minimo: 50, claseAbc: "A", precio: 15.50 },
  { codigo: "MED-045", nombre: "Losartán 50mg", categoria: "Cardiología", laboratorio: "Pfizer", stock: 250, minimo: 100, claseAbc: "A", precio: 22.00 },
  { codigo: "MED-112", nombre: "Ibuprofeno 400mg", categoria: "Analgésicos", laboratorio: "Genfar", stock: 45, minimo: 40, claseAbc: "B", precio: 5.25 },
  { codigo: "MED-889", nombre: "Vitamina C 1000mg", categoria: "Suplementos", laboratorio: "La Sante", stock: 500, minimo: 20, claseAbc: "C", precio: 8.00 },
  { codigo: "MED-204", nombre: "Omeprazol 20mg", categoria: "Gástricos", laboratorio: "Saval", stock: 180, minimo: 50, claseAbc: "B", precio: 12.50 },
  { codigo: "MED-002", nombre: "Ciprofloxacino 500mg", categoria: "Antibióticos", laboratorio: "Bayer", stock: 80, minimo: 30, claseAbc: "B", precio: 18.90 },
  { codigo: "MED-003", nombre: "Azitromicina 500mg", categoria: "Antibióticos", laboratorio: "Saval", stock: 15, minimo: 40, claseAbc: "A", precio: 25.50 },
  { codigo: "MED-010", nombre: "Paracetamol 1g", categoria: "Analgésicos", laboratorio: "Genfar", stock: 600, minimo: 150, claseAbc: "B", precio: 2.10 },
  { codigo: "MED-011", nombre: "Aspirina 100mg", categoria: "Analgésicos", laboratorio: "Bayer", stock: 50, minimo: 100, claseAbc: "A", precio: 1.80 },
  { codigo: "MED-046", nombre: "Atorvastatina 20mg", categoria: "Cardiología", laboratorio: "Pfizer", stock: 30, minimo: 50, claseAbc: "A", precio: 24.50 },
  { codigo: "MED-047", nombre: "Enalapril 10mg", categoria: "Cardiología", laboratorio: "Genfar", stock: 120, minimo: 100, claseAbc: "C", precio: 4.20 },
  { codigo: "MED-080", nombre: "Clonazepam 2mg", categoria: "Psicotrópicos", laboratorio: "Saval", stock: 90, minimo: 80, claseAbc: "A", precio: 19.50 },
  { codigo: "MED-081", nombre: "Fluoxetina 20mg", categoria: "Psicotrópicos", laboratorio: "Bayer", stock: 40, minimo: 50, claseAbc: "B", precio: 21.00 },
  { codigo: "MED-205", nombre: "Ranitidina 150mg", categoria: "Gástricos", laboratorio: "Saval", stock: 15, minimo: 50, claseAbc: "C", precio: 3.50 }
];

export async function fetchInventarioItemsApi(): Promise<InventarioItem[]> {
  // Simular latencia de red de 400ms
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_INVENTARIO]);
    }, 400);
  });
}

export async function createInventarioItemApi(
  item: Omit<InventarioItem, "codigo">
): Promise<InventarioItem> {
  // Simular latencia de red de 600ms
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generar un código aleatorio secuencial
      const randomId = Math.floor(Math.random() * 900) + 100;
      const newItem: InventarioItem = {
        ...item,
        codigo: `MED-${randomId}`,
      };
      resolve(newItem);
    }, 600);
  });
}
export default fetchInventarioItemsApi;
