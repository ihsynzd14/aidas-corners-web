export interface Order {
  id: string;
  branchId: string;
  date: string;
  products: OrderProduct[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderFormData {
  branchId: string;
  date: string;
  products: {
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
} 