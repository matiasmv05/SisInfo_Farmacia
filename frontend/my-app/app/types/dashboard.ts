export interface InventoryAlert {
  id: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  status: 'STOCK CRÍTICO' | 'VENCE < 15 DÍAS' | 'STOCK BAJO';
  statusColor: 'error' | 'warning' | 'low';
}

export interface KpiData {
  activeAlerts: {
    total: number;
    critical: number;
    medium: number;
  };
  criticalStockPercentage: number;
  expiringPercentage: number;
  pendingOrders: number;
}

export interface AbcDistributionItem {
  id: string;
  classType: 'A' | 'B' | 'C';
  investmentPercentage: number;
  skuPercentage: number;
}
