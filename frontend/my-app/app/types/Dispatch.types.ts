// app/types/Dispatch.types.ts

export interface Product {
  id: string;
  name: string;
  ndc: string;
  description: string;
  image: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  requirements: string[];
  dualSignatureRequired: boolean;
}

export interface Lot {
  id: string;
  productId: string;
  lotNumber: string;
  expiryDate: string; // YYYY-MM-DD
  availableQuantity: number;
  fefoPreselect: boolean;
}

export interface DispatchTransaction {
  id: string;
  productId: string;
  productName: string;
  lotId: string;
  lotNumber: string;
  quantity: number;
  timestamp: string;
  witnessName?: string;
}
