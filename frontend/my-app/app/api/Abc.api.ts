// app/api/Abc.api.ts

export interface ProductMock {
  codigo: string;
  articulo: string;
  stock: number;
  costo: number;
}

// Catálogo simulado rico para posibilitar paginación, filtros y ordenamiento real
const MOCK_PRODUCTS: ProductMock[] = [
  { codigo: "AMX-500", articulo: "Amoxicilina 500mg Caps", stock: 290, costo: 50.00 }, // $14,500.00
  { codigo: "PAR-100", articulo: "Paracetamol 1g Comp", stock: 610, costo: 20.00 },  // $12,200.00
  { codigo: "IBU-400", articulo: "Ibuprofeno 400mg Grag", stock: 410, costo: 10.00 },  // $4,100.00
  { codigo: "OME-20",  articulo: "Omeprazol 20mg Caps", stock: 1200, costo: 8.50 },   // $10,200.00
  { codigo: "ASP-100", articulo: "Aspirina 100mg Comp", stock: 500, costo: 15.00 },   // $7,500.00
  { codigo: "LOS-50",  articulo: "Losartán 50mg Comp", stock: 800, costo: 12.00 },    // $9,600.00
  { codigo: "MET-850", articulo: "Metformina 850mg Comp", stock: 900, costo: 14.00 },  // $12,600.00
  { codigo: "CLO-2",   articulo: "Clonazepam 2mg Comp", stock: 350, costo: 25.00 },   // $8,750.00
  { codigo: "ATOR-20", articulo: "Atorvastatina 20mg Comp", stock: 650, costo: 18.00 },// $11,700.00
  { codigo: "AZI-500", articulo: "Azitromicina 500mg Comp", stock: 200, costo: 30.00 },// $6,000.00
  { codigo: "SAL-100", articulo: "Salbutamol 100mcg Inhalador", stock: 180, costo: 45.00 }, // $8,100.00
  { codigo: "VIT-C",   articulo: "Vitamina C 1g Efervescente", stock: 300, costo: 16.00 }, // $4,800.00
  { codigo: "CET-10",  articulo: "Cetirizina 10mg Comp", stock: 400, costo: 9.00 },    // $3,600.00
  { codigo: "LOR-10",  articulo: "Loratadina 10mg Comp", stock: 700, costo: 7.50 },    // $5,250.00
  { codigo: "CRE-BAC", articulo: "Crema Antibacteriana 15g", stock: 120, costo: 22.00 },// $2,640.00
  { codigo: "ALC-96",  articulo: "Alcohol Etílico 96° 250ml", stock: 150, costo: 3.00 }, // $450.00
  { codigo: "GAS-10",  articulo: "Gasa Estéril 10x10cm", stock: 100, costo: 1.20 },    // $120.00
  { codigo: "JER-10",  articulo: "Jeringa Desechable 10ml", stock: 1500, costo: 0.50 }, // $750.00
  { codigo: "TAP-FAC", articulo: "Tapabocas Quirúrgico x50", stock: 80, costo: 12.50 }, // $1,000.00
  { codigo: "ALC-GEL", articulo: "Alcohol en Gel 500ml", stock: 250, costo: 6.00 }      // $1,500.00
];

export async function fetchAbcItemsApi(): Promise<ProductMock[]> {
  // Simular latencia de red de 400ms
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_PRODUCTS]);
    }, 400);
  });
}

export async function recalculateAbcItemsApi(
  adjustments: { [codigo: string]: { stock?: number; costo?: number } }
): Promise<ProductMock[]> {
  // Simular latencia de red de 1000ms al disparar recálculo de Pareto
  return new Promise((resolve) => {
    setTimeout(() => {
      const updated = MOCK_PRODUCTS.map((prod) => {
        const adj = adjustments[prod.codigo];
        if (adj) {
          return {
            ...prod,
            stock: adj.stock !== undefined ? adj.stock : prod.stock,
            costo: adj.costo !== undefined ? adj.costo : prod.costo,
          };
        }
        return prod;
      });
      resolve(updated);
    }, 1000);
  });
}
