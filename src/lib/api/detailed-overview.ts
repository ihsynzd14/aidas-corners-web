import { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://aidas-corners-springboot-production.up.railway.app/api';

interface FetchOrdersParams {
  startDate: string;
  endDate: string;
}

export const fetchOrders = async ({ startDate, endDate }: FetchOrdersParams): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/orders?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        credentials: 'omit',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Məlumatları əldə edərkən xəta baş verdi');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error instanceof Error 
      ? error 
      : new Error('Bilinməyən xəta baş verdi');
  }
}; 