import { InventoryAlert, KpiData, AbcDistributionItem } from '../types/dashboard';

export const mockKpiData: KpiData = {
  activeAlerts: {
    total: 24,
    critical: 8,
    medium: 16,
  },
  criticalStockPercentage: 4.2,
  expiringPercentage: 1.8,
  pendingOrders: 12,
};

export const mockAlerts: InventoryAlert[] = [
  {
    id: '1',
    sku: 'AMX-500-24',
    productName: 'Amoxicilina 500mg Caps',
    category: 'Antibióticos',
    currentStock: 5,
    status: 'STOCK CRÍTICO',
    statusColor: 'error',
  },
  {
    id: '2',
    sku: 'INS-GLA-100',
    productName: 'Insulina Glargina 100UI/mL',
    category: 'Antidiabéticos',
    currentStock: 42,
    status: 'VENCE < 15 DÍAS',
    statusColor: 'error',
  },
  {
    id: '3',
    sku: 'IBU-400-50',
    productName: 'Ibuprofeno 400mg Tabs',
    category: 'Analgésicos',
    currentStock: 18,
    status: 'STOCK BAJO',
    statusColor: 'warning',
  },
];

export const mockAbcDistribution: AbcDistributionItem[] = [
  {
    id: 'A',
    classType: 'A',
    investmentPercentage: 80,
    skuPercentage: 20,
  },
  {
    id: 'B',
    classType: 'B',
    investmentPercentage: 15,
    skuPercentage: 30,
  },
  {
    id: 'C',
    classType: 'C',
    investmentPercentage: 5,
    skuPercentage: 50,
  },
];
