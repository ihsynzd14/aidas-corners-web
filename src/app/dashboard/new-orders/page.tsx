'use client';

import { Suspense, useState } from 'react';
import { Metadata } from 'next';
import OrderListSkeleton from '@/components/orders/OrderListSkeleton';
import CreateOrderButton from '@/components/orders/CreateOrderButton';
import { OrdersCalendar } from '@/components/orders/OrdersCalendar';
import { OrdersList } from '@/components/orders/OrdersList';
import { OrdersTotalSummary } from '@/components/orders/OrdersTotalSummary';

export default function NewOrdersPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-amber-900 dark:text-gray-100">
                Yeni Sifarişlər
              </h1>
              <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                Yeni sifarişlərin siyahısı və idarə edilməsi
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrdersCalendar 
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                onDataChange={handleDataChange}
              />
              <CreateOrderButton />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
          {/* Sol Panel - Siparişler Listesi */}
          <div className="xl:col-span-6">
            <div className="relative rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-sm">
              <Suspense 
                fallback={
                  <div className="space-y-4">
                    <OrderListSkeleton />
                  </div>
                }
              >
                <h2 className="text-lg font-semibold text-amber-900 dark:text-gray-100">
                  Filiallara görə hesabat
                </h2>
                <OrdersList   
                  selectedDate={selectedDate}
                  onDataChange={handleDataChange}
                />
              </Suspense>
            </div>
          </div>

          {/* Sağ Panel - İstatistikler */}
          <div className="xl:col-span-4">
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-amber-900 dark:text-gray-100">
                  Ümumi Hesabat
                </h2>
              </div>
              <Suspense fallback={<div>Yüklənir...</div>}>
                <OrdersTotalSummary 
                  selectedDate={selectedDate}
                  onDataChange={handleDataChange}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 