'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollAreaRoot } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  CollapsibleRoot,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Share2,
  Store,
  Package,
  ShoppingCart,
  FileDown
} from 'lucide-react';
import { normalizeProductName } from '@/lib/utils';
import { fetchOrdersByDate } from '@/lib/firebase/orders';
import { toast } from 'sonner';
import { formatWhatsAppMessage, generatePDF } from '@/lib/utils/report';

interface OrdersTotalSummaryProps {
  selectedDate: Date;
  onDataChange: () => void;
}

interface BranchQuantity {
  branchName: string;
  quantity: number;
}

export function OrdersTotalSummary({ selectedDate, onDataChange }: OrdersTotalSummaryProps) {
  const [ordersData, setOrdersData] = useState<Record<string, Record<string, string>>>({});
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const data = await fetchOrdersByDate(selectedDate);
      setOrdersData(data || {});
    } catch (error) {
      console.error('Sifarişləri yükləmək mümkün olmadı:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, onDataChange]);

  const getBranchQuantities = (productName: string): BranchQuantity[] => {
    const quantities: BranchQuantity[] = [];
    if (!ordersData) return quantities;

    Object.entries(ordersData).forEach(([branchName, products]) => {
      Object.entries(products).forEach(([product, quantity]) => {
        if (normalizeProductName(product) === normalizeProductName(productName)) {
          quantities.push({
            branchName,
            quantity: parseFloat(quantity.toString())
          });
        }
      });
    });
    return quantities.sort((a, b) => b.quantity - a.quantity);
  };

  const calculateTotals = () => {
    const totals: Record<string, { normalizedName: string; originalName: string; quantity: number }> = {};
    
    if (!ordersData) return {};

    Object.values(ordersData).forEach((branchProducts) => {
      Object.entries(branchProducts).forEach(([product, quantity]) => {
        const normalizedName = normalizeProductName(product);
        
        if (!totals[normalizedName]) {
          totals[normalizedName] = {
            normalizedName,
            originalName: product,
            quantity: 0
          };
        }
        
        totals[normalizedName].quantity += parseFloat(quantity.toString());
      });
    });

    const finalTotals: Record<string, number> = {};
    Object.values(totals).forEach(({ originalName, quantity }) => {
      finalTotals[originalName] = quantity;
    });
    
    return finalTotals;
  };

  const toggleProductExpansion = (product: string) => {
    setExpandedProducts(prev => 
      prev.includes(product)
        ? prev.filter(p => p !== product)
        : [...prev, product]
    );
  };

  if (!ordersData || Object.keys(ordersData).length === 0) {
    return (
      <Card className="p-8 dark:bg-gray-800/90 dark:border-gray-700">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-full bg-amber-50 dark:bg-amber-900/20 w-fit mx-auto">
            <Package className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Məlumat tapılmadı
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Bu tarix üçün heç bir sifariş yoxdur
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const totals = calculateTotals();
  const totalProducts = Object.keys(totals).length;
  const totalQuantity = Object.values(totals).reduce((sum, qty) => sum + qty, 0);
  const totalBranches = Object.keys(ordersData).length;

  return (
    <Card className="p-6 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="space-y-8">
        {/* Özet Bilgileri */}
        <div className="grid grid-cols-3 gap-6">
          <div className="relative overflow-hidden text-center p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-default group dark:border dark:border-gray-700 min-h-[180px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
            <div className="relative flex flex-col items-center">
              <div className="p-3 rounded-xl bg-white/90 dark:bg-gray-800 shadow-sm w-fit mx-auto mb-4 ring-1 ring-amber-100 dark:ring-gray-700">
                <Package className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-amber-900 dark:text-gray-100 mb-2 tabular-nums">
                {totalProducts}
              </div>
              <div className="text-sm font-medium text-amber-700 dark:text-gray-400">
                Növ
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden text-center p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-default group dark:border dark:border-gray-700 min-h-[180px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
            <div className="relative flex flex-col items-center">
              <div className="p-3 rounded-xl bg-white/90 dark:bg-gray-800 shadow-sm w-fit mx-auto mb-4 ring-1 ring-amber-100 dark:ring-gray-700">
                <ShoppingCart className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-amber-900 dark:text-gray-100 mb-2 tabular-nums">
                {totalQuantity}
              </div>
              <div className="text-sm font-medium text-amber-700 dark:text-gray-400">
                Ədəd
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden text-center p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-default group dark:border dark:border-gray-700 min-h-[180px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
            <div className="relative flex flex-col items-center">
              <div className="p-3 rounded-xl bg-white/90 dark:bg-gray-800 shadow-sm w-fit mx-auto mb-4 ring-1 ring-amber-100 dark:ring-gray-700">
                <Store className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-amber-900 dark:text-gray-100 mb-2 tabular-nums">
                {totalBranches}
              </div>
              <div className="text-sm font-medium text-amber-700 dark:text-gray-400">
                Şöbə
              </div>
            </div>
          </div>
        </div>

        {/* Paylaşım Düğmeleri */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-300 dark:border-gray-700 dark:text-gray-300"
            onClick={() => {
              const message = formatWhatsAppMessage(totals, totalProducts, totalQuantity, totalBranches);
              window.open(`whatsapp://send?text=${encodeURIComponent(message)}`, '_blank');
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Paylaş
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-300 dark:border-gray-700 dark:text-gray-300"
            onClick={() => {
              const message = formatWhatsAppMessage(totals, totalProducts, totalQuantity, totalBranches);
              navigator.clipboard.writeText(message);
              toast.success('Məlumatlar kopyalandı');
            }}
          >
            <Copy className="w-4 h-4 mr-2" />
            Kopyala
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-300 dark:border-gray-700 dark:text-gray-300"
            onClick={() => {
              generatePDF(totals, totalProducts, totalQuantity, totalBranches, ordersData);
            }}
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>

        {/* Ürün Listesi */}
        <ScrollAreaRoot className="h-[400px] pr-4 -mr-4">
          <div className="space-y-3">
            {Object.entries(totals).map(([product, total]) => (
              <CollapsibleRoot
                key={product}
                open={expandedProducts.includes(product)}
                onOpenChange={() => toggleProductExpansion(product)}
              >
                <CollapsibleTrigger asChild>
                  <div className="group cursor-pointer">
                    <div className="flex items-center justify-between p-4 bg-amber-50/70 dark:bg-gray-800 rounded-xl transition-all duration-300 hover:shadow-sm dark:border dark:border-gray-700">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 shadow-sm ring-1 ring-amber-100 dark:ring-gray-700">
                              <Package className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                            </div>
                            <span className="font-medium tracking-tight text-gray-900 dark:text-gray-100">{product}</span>
                          </div>
                          <span className="text-amber-600 dark:text-amber-500 font-semibold bg-amber-50 dark:bg-gray-900 px-3 py-1 rounded-lg dark:border dark:border-gray-700">
                            {total}
                          </span>
                        </div>
                      </div>
                      <div 
                        className="ml-2 p-2 rounded-lg bg-amber-100/70 dark:bg-gray-700 hover:bg-amber-200/70 dark:hover:bg-gray-600 transition-all duration-300"
                      >
                        {expandedProducts.includes(product) ? (
                          <ChevronUp className="h-4 w-4 text-amber-600 dark:text-gray-300" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-amber-600 dark:text-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="space-y-2.5 py-3 pl-14">
                    {getBranchQuantities(product).map((branch, index) => (
                      <div
                        key={branch.branchName}
                        className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800 hover:bg-gray-100/80 dark:hover:bg-gray-700 transition-colors duration-300 shadow-sm dark:border dark:border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <Store className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {branch.branchName}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg dark:border dark:border-gray-700">
                          {branch.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </CollapsibleRoot>
            ))}
          </div>
        </ScrollAreaRoot>
      </div>
    </Card>
  );
} 