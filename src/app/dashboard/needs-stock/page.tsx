import { Suspense } from 'react';
import NeedsStockContent from '@/components/needs-stock/NeedsStockContent';
import { PageHeader } from '@/components/ui/page-header';

export const metadata = {
  title: 'Ərzaq Təqibi| Dashboard',
  description: 'Ərzaq ehtiyaclarını izləmək və idarə etmək üçün panel',
};

export default function NeedsStockPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <PageHeader
        title="Ərzaq Təqibi"
        description="Ərzaq ehtiyaclarını izləyin və idarə edin"
      />
      <Suspense fallback={<div className="flex items-center justify-center w-full h-64">Yüklənir...</div>}>
        <NeedsStockContent />
      </Suspense>
    </div>
  );
} 