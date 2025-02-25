export interface Branch {
  branchId: string;
  branchName: string;
  products: {
    [key: string]: string;
  };
}

export interface ApiResponse {
  [dateRange: string]: Branch[];
}

export interface Product {
  name: string;
  totalQuantity: number;
  branchQuantities: {
    [key: string]: number;
  };
}

export interface OrdersApiResponse {
  success: boolean;
  data: ApiResponse;
  error?: string;
} 