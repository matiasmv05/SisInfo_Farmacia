// app/services/dispatch.service.ts

import { Product, Lot, DispatchTransaction } from "../types/Dispatch.types";

// Catálogo de Productos Mock en Memoria
const initialProducts: Product[] = [
  {
    id: "prod-001",
    name: "Naloxone HCl 0.4mg/mL Injection",
    ndc: "0000-0000-00",
    description: "10mL Multiple-dose Vial",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2gkprG9jdJHLh7j6O2Pb0GeKPrvaS75k7bJ6LkxMZOIXawSZeMntHRS8oboHwnSumvqZsiie1RweKfysLJyVJrH6rGJwK9_OzBQeSSEzmgMAU18nOtg1KPY0yOoUEeWqCFKJuIn3y-fOfTkaMWDVD91q8M8-94QB3pY1QmSjg51GFbX3rPaV2ryn5U5FrZj1qzTviMKBBdA0YwCqt-7tXdgZCZJip5oIWrB1rKfPxHNKddMMKH7S31ZnjtFKVk6JnZ-1p3V26iw",
    zone: "Zone A • Cold Storage",
    rack: "12",
    shelf: "B",
    bin: "04",
    requirements: ["Refrigerated (2-8°C)", "Light Sensitive"],
    dualSignatureRequired: true,
  },
  {
    id: "prod-002",
    name: "Insulina Glargina 100 U/mL",
    ndc: "0002-8215-01",
    description: "3mL Pen Device (Lantus)",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    zone: "Zone A • Cold Storage",
    rack: "03",
    shelf: "A",
    bin: "09",
    requirements: ["Refrigerated (2-8°C)"],
    dualSignatureRequired: false,
  },
  {
    id: "prod-003",
    name: "Fentanilo Citrato 50mcg/mL",
    ndc: "0409-9093-22",
    description: "2mL Ampoule (Controlled)",
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    zone: "Zone B • Controlled Substances Vault",
    rack: "Secure-01",
    shelf: "C",
    bin: "02",
    requirements: ["Locked Vault", "Double Lock", "Restricted Access"],
    dualSignatureRequired: true,
  },
  {
    id: "prod-004",
    name: "Amoxicilina 500mg Cápsulas",
    ndc: "0093-3107-05",
    description: "Oral Antibiotic (100 Capsule Bottle)",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    zone: "Zone C • Room Temperature",
    rack: "24",
    shelf: "E",
    bin: "15",
    requirements: ["Keep Dry (15-30°C)"],
    dualSignatureRequired: false,
  },
];

// Lotes en memoria con cantidades mutables
const initialLots: Lot[] = [
  // Lotes para Naloxona
  {
    id: "lot-001a",
    productId: "prod-001",
    lotNumber: "NX-2023-889A",
    expiryDate: "2024-11-30",
    availableQuantity: 1450,
    fefoPreselect: true,
  },
  {
    id: "lot-001b",
    productId: "prod-001",
    lotNumber: "NX-2025-012B",
    expiryDate: "2026-06-30",
    availableQuantity: 3200,
    fefoPreselect: false,
  },
  // Lotes para Insulina
  {
    id: "lot-002a",
    productId: "prod-002",
    lotNumber: "INS-2024-11X",
    expiryDate: "2024-12-15",
    availableQuantity: 450,
    fefoPreselect: true,
  },
  {
    id: "lot-002b",
    productId: "prod-002",
    lotNumber: "INS-2025-02Y",
    expiryDate: "2026-02-28",
    availableQuantity: 1200,
    fefoPreselect: false,
  },
  // Lotes para Fentanilo
  {
    id: "lot-003a",
    productId: "prod-003",
    lotNumber: "FTN-2024-88A",
    expiryDate: "2025-03-31",
    availableQuantity: 80,
    fefoPreselect: true,
  },
  {
    id: "lot-003b",
    productId: "prod-003",
    lotNumber: "FTN-2024-95C",
    expiryDate: "2026-10-31",
    availableQuantity: 250,
    fefoPreselect: false,
  },
  // Lotes para Amoxicilina
  {
    id: "lot-004a",
    productId: "prod-004",
    lotNumber: "AMX-2024-001",
    expiryDate: "2026-04-30",
    availableQuantity: 500,
    fefoPreselect: true,
  },
];

// Estado en memoria persistido por ciclo de vida de la página
let products = [...initialProducts];
let lots = [...initialLots];

export const dispatchService = {
  /**
   * Obtiene todos los productos
   */
  getProducts(): Product[] {
    return products;
  },

  /**
   * Busca productos por nombre o NDC
   */
  searchProducts(query: string): Product[] {
    if (!query) return [];
    const normalizedQuery = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.ndc.replace(/-/g, "").includes(normalizedQuery.replace(/-/g, ""))
    );
  },

  /**
   * Obtiene todos los lotes de un producto específico
   */
  getLotsForProduct(productId: string): Lot[] {
    return lots.filter((l) => l.productId === productId);
  },

  /**
   * Obtiene el lote sugerido FEFO (el que expira primero con stock disponible > 0)
   */
  getSuggestedLot(productId: string): Lot | null {
    const productLots = this.getLotsForProduct(productId).filter(
      (l) => l.availableQuantity > 0
    );
    if (productLots.length === 0) return null;

    // Ordenar por fecha de expiración (FEFO)
    return productLots.reduce((oldest, current) => {
      return new Date(current.expiryDate) < new Date(oldest.expiryDate)
        ? current
        : oldest;
    });
  },

  /**
   * Simula la ejecución de un despacho restando la cantidad del lote en memoria
   */
  async executeDispatch(
    productId: string,
    lotId: string,
    quantity: number,
    witnessName?: string
  ): Promise<DispatchTransaction> {
    return new Promise((resolve, reject) => {
      // Retraso de 400ms para simular red/proceso real
      setTimeout(() => {
        const product = products.find((p) => p.id === productId);
        const lot = lots.find((l) => l.id === lotId && l.productId === productId);

        if (!product) {
          return reject(new Error("Producto no encontrado."));
        }
        if (!lot) {
          return reject(new Error("Lote no válido para este producto."));
        }
        if (lot.availableQuantity < quantity) {
          return reject(
            new Error(
              `Cantidad insuficiente. Disponible: ${lot.availableQuantity} unidades.`
            )
          );
        }
        if (quantity <= 0) {
          return reject(new Error("La cantidad debe ser mayor a 0."));
        }
        if (product.dualSignatureRequired && !witnessName) {
          return reject(
            new Error(
              "Falta firma doble. Este producto controlado requiere de un testigo."
            )
          );
        }

        // Restar inventario en el estado mockeado
        lot.availableQuantity -= quantity;

        // Crear registro de transacción
        const transaction: DispatchTransaction = {
          id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
          productId: product.id,
          productName: product.name,
          lotId: lot.id,
          lotNumber: lot.lotNumber,
          quantity: quantity,
          timestamp: new Date().toISOString(),
          witnessName: witnessName,
        };

        resolve(transaction);
      }, 400);
    });
  },

  /**
   * Restablece el inventario mockeado a los valores iniciales
   */
  resetInventory(): void {
    products = [...initialProducts];
    lots = initialLots.map((l) => ({ ...l }));
  },
};
