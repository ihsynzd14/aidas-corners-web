import { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aidas-corners-springboot-production.up.railway.app/api';

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
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        cache: 'no-store',
        next: {
          revalidate: 0,
          tags: ['orders']
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error('Məlumatları əldə edərkən xəta baş verdi');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Bilinməyən xəta baş verdi');
  }
}; 