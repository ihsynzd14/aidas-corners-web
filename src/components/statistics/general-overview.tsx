'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { 
  Loader2, 
  ArrowUpDown, 
  Search, 
  RefreshCcw, 
  ChevronDown, 
  Share2, 
  Copy,
  BarChart as ChartBarIcon,
  Box as BoxesIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Share as ShareIcon,
  Info as InfoIcon
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { fetchOrders } from '@/lib/api/detailed-overview';
import { Product } from '@/types/api';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { generateGeneralReport } from '@/lib/utils/general-overview';

type SortOption = 'quantity-desc' | 'quantity-asc' | 'name-asc' | 'name-desc';

const INITIAL_LOAD_COUNT = 6;

// Prevent hydration issues with dynamic import
const GeneralOverviewContent = dynamic(() => Promise.resolve(GeneralOverviewComponent), {
  ssr: false,
});

function GeneralOverviewComponent() {
  // All useState hooks
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // useLocalStorage hooks
  const [date, setDate] = useLocalStorage<DateRange | undefined>('stats-date-range', undefined);
  const [sortOption, setSortOption] = useLocalStorage<SortOption>('stats-sort-option', 'quantity-desc');

  // useCallback hooks
  const sortProducts = useCallback((productsToSort: Product[], option: SortOption) => {
    return [...productsToSort].sort((a, b) => {
      switch (option) {
        case 'quantity-desc':
          return b.totalQuantity - a.totalQuantity;
        case 'quantity-asc':
          return a.totalQuantity - b.totalQuantity;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortOption(value);
  }, [setSortOption]);

  const toggleCard = useCallback((productName: string) => {
    setExpandedCard(prev => prev === productName ? null : productName);
  }, []);

  const fetchData = useCallback(async (showToast = false) => {
    if (!date?.from || !date?.to) return;

    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const startDate = format(date.from, 'yyyy-MM-dd');
      const endDate = format(date.to, 'yyyy-MM-dd');
      
      const data = await fetchOrders({ startDate, endDate });
      const dateRangeKey = Object.keys(data)[0];
      const branches = data[dateRangeKey];

      if (!branches?.length) {
        throw new Error('Məlumatlar tapılmadı');
      }

      const totalBranch = branches.find(b => b.branchId === 'total');
      const regularBranches = branches.filter(b => b.branchId !== 'total');

      if (!totalBranch) {
        throw new Error('Ümumi məlumatlar tapılmadı');
      }

      const processedProducts: Product[] = Object.entries(totalBranch.products)
        .filter(([, quantity]) => parseFloat(quantity) > 0)
        .reduce((acc: Product[], [name, totalQuantity]) => {
          // Normalize product name by trimming whitespace
          const normalizedName = name.trim();
          
          // Find existing product with the same normalized name
          const existingProduct = acc.find(p => p.name === normalizedName);
          
          if (existingProduct) {
            // If product exists, add to its quantities
            existingProduct.totalQuantity += parseFloat(totalQuantity);
            
            // Merge branch quantities
            regularBranches.forEach(branch => {
              if (branch.products[name]) {
                const quantity = parseFloat(branch.products[name]);
                if (quantity > 0) {
                  existingProduct.branchQuantities[branch.branchName] = 
                    (existingProduct.branchQuantities[branch.branchName] || 0) + quantity;
                }
              }
            });
            
            return acc;
          }
          
          // If product doesn't exist, create new entry
          const branchQuantities: { [key: string]: number } = {};
          regularBranches.forEach(branch => {
            if (branch.products[name]) {
              const quantity = parseFloat(branch.products[name]);
              if (quantity > 0) {
                branchQuantities[branch.branchName] = quantity;
              }
            }
          });

          acc.push({
            name: normalizedName,
            totalQuantity: parseFloat(totalQuantity),
            branchQuantities
          });
          
          return acc;
        }, []);

      setProducts(processedProducts);
      setIsInitialLoad(false);
      
      if (showToast) {
        toast.success('Məlumatlar yeniləndi');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinməyən xəta baş verdi';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  }, [date]);

  // useMemo hooks
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortProducts(filtered, sortOption);
  }, [products, searchTerm, sortOption, sortProducts]);

  const totalSales = useMemo(() => 
    products.reduce((sum, p) => sum + p.totalQuantity, 0),
    [products]
  );

  const { maxProduct, minProduct } = useMemo(() => {
    if (!products.length) return { maxProduct: null, minProduct: null };

    // Exclude specific products from min calculation
    const excludedProducts = ['Şokolad', 'Şokolad Lokumlu'];
    const filteredProducts = products.filter(p => !excludedProducts.includes(p.name));

    let max = products[0];
    let min = filteredProducts[0] || products[0]; // Fallback to all products if filtered is empty

    products.forEach(product => {
      if (product.totalQuantity > max.totalQuantity) {
        max = product;
      }
    });

    filteredProducts.forEach(product => {
      if (product.totalQuantity < min.totalQuantity) {
        min = product;
      }
    });

    return { maxProduct: max, minProduct: min };
  }, [products]);

  // useEffect hooks
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (date?.from && date?.to) {
      fetchData();
    }
  }, [date, fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleShare = () => {
    const reportData = {
      [date?.from ? `${format(date.from, 'dd.MM.yyyy')} - ${format(date.to!, 'dd.MM.yyyy')}` : '']: [
        {
          branchId: 'total',
          branchName: 'Total Across All Branches',
          date: date?.from ? `${format(date.from, 'dd.MM.yyyy')} - ${format(date.to!, 'dd.MM.yyyy')}` : '',
          products: Object.fromEntries(
            products.map(p => [p.name, p.totalQuantity.toString()])
          )
        },
        ...products.flatMap(p => 
          Object.entries(p.branchQuantities).map(([branchName, quantity]) => ({
            branchId: branchName,
            branchName: branchName,
            date: date?.from ? `${format(date.from, 'dd.MM.yyyy')} - ${format(date.to!, 'dd.MM.yyyy')}` : '',
            products: { [p.name]: quantity.toString() }
          }))
        )
      ]
    };

    const report = generateGeneralReport(reportData);
    return report;
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Yüklənir...</h2>
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isInitialLoad && !date?.from) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Tarix aralığı seçin</h2>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <Alert>
          <AlertDescription>
            Başlamaq üçün tarix aralığı seçin
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {products.length > 0 && (
        <Card className="border-border/40 bg-gradient-to-br from-card/50 to-card/30 transition-all duration-300 hover:shadow-lg hover:from-card/60 hover:to-card/40">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-primary/70" />
                <span className="text-lg text-amber-900">Ümumi Statistika</span>
              </div>
              {products.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const report = handleShare();
                      navigator.clipboard.writeText(report);
                      toast.success('Hesabat kopyalandı', {
                        description: 'Hesabat panoya kopyalandı, istədiyiniz yerə yapışdıra bilərsiniz.'
                      });
                    }}
                    className="border-border/40 hover:bg-accent hover:text-primary transition-colors h-8"
                  >
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    <span className="text-sm">Hesabatı kopyala</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      toast.info('Hesabat haqqında', {
                        description: 'Bu hesabat seçilmiş tarix aralığında bütün filiallar üzrə satış statistikasını əks etdirir.',
                        duration: 5000,
                      });
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                  >
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors group">
                <div className="flex items-center gap-2">
                  <BoxesIcon className="h-4 w-4 text-primary/70" />
                  <p className="text-sm text-muted-foreground font-medium ">Toplam Məhsul Növü</p>
                </div>
                <p className="text-2xl font-bold text-amber-900 dark:text-foreground/90 group-hover:text-primary/90 transition-colors ">
                  {products.length.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors group">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-4 w-4 text-primary/70" />
                  <p className="text-sm text-muted-foreground font-medium">Ümumi Satış</p>
                </div>
                <p className="text-2xl font-bold text-amber-900 dark:text-foreground/90 group-hover:text-primary/90 transition-colors">
                  {totalSales.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors group">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm text-muted-foreground font-medium">Ən Çox Satan</p>
                </div>
                <div className="space-y-0.5 flex items-center gap-2">
                  <p className="text-xl font-bold text-emerald-500/90">
                    {maxProduct?.totalQuantity.toLocaleString()}
                  </p>
                  <p className="text-md font-medium dark:text-foreground/90 group-hover:text-primary/90 transition-colors">
                    {maxProduct?.name}
                  </p>
                </div>
              </div>
              <div className="space-y-2 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDownIcon className="h-4 w-4 text-rose-500" />
                    <p className="text-sm text-muted-foreground font-medium">Ən Az Satan</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Xüsusi:</span>
                    {products
                      .filter(p => ['Şokolad', 'Şokolad Lokumlu'].includes(p.name))
                      .map(p => (
                        <span key={p.name} className="font-medium text-foreground/90">
                          {p.name.includes('Lokumlu') ? 'Lokumlu:' : 'Şokolad:'} {p.totalQuantity.toLocaleString()}
                        </span>
                      ))
                    } 
                  </div>
                </div>
                <div className="space-y-0.5 flex items-center gap-2">
                  <p className="text-xl font-bold text-rose-500/90">
                    {minProduct?.totalQuantity.toLocaleString()}
                  </p>
                  <p className="text-md font-medium dark:text-foreground/90 group-hover:text-primary/90 transition-colors">
                    {minProduct?.name}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h2 className="text-xl font-semibold text-primary">Tarix aralığı seçin</h2>
          <div className="flex gap-2 items-center">
            <DatePickerWithRange date={date} setDate={setDate} />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
              className="border-border/40 hover:bg-accent"
            >
              <RefreshCcw className={cn(
                "h-4 w-4",
                loading && "animate-spin"
              )} />
            </Button>
          </div>
        </div>

        {loading && (
          <Progress value={loadingProgress} className="w-full transition-all bg-accent" />
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {products.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Məhsul axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 bg-card border-border/40"
                />
              </div>
            </div>
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[200px] bg-card border-border/40">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity-desc">Miqdar (Çoxdan aza)</SelectItem>
                <SelectItem value="quantity-asc">Miqdar (Azdan çoxa)</SelectItem>
                <SelectItem value="name-asc">Ad (A-Z)</SelectItem>
                <SelectItem value="name-desc">Ad (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array(INITIAL_LOAD_COUNT).fill(0).map((_, i) => (
                <Card key={i} className="space-y-4 border-border/40 bg-card/50">
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4 bg-accent" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2 bg-accent" />
                  </CardContent>
                </Card>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {searchTerm ? 'Axtarışa uyğun məhsul tapılmadı' : 'Məhsul tapılmadı'}
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full col-span-full space-y-2">
                {filteredProducts.map((product) => (
                  <AccordionItem 
                    key={product.name} 
                    value={product.name}
                    className="border border-border/40 bg-card/50 rounded-lg px-2 data-[state=open]:bg-accent/5 transition-all duration-200"
                  >
                    <AccordionTrigger className="hover:no-underline py-4 px-2">
                      <div className="flex justify-between items-center w-full gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary/70" />
                          <span className="text-base font-medium text-amber-900 dark:text-foreground/90">{product.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold whitespace-nowrap text-amber-900 dark:text-foreground/90 tabular-nums pr-2">
                            {product.totalQuantity.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 py-2 px-2">
                        {(() => {
                          // Toplam satış miktarını hesapla
                          const totalQuantity = Object.values(product.branchQuantities).reduce((sum, q) => sum + q, 0);

                          return Object.entries(product.branchQuantities)
                            .sort(([, a], [, b]) => b - a)
                            .map(([branchName, quantity], index) => {
                              // Her şube için yüzdeyi hesapla
                              const percentage = (quantity / totalQuantity) * 100;

                              return (
                                <div 
                                  key={branchName} 
                                  className={cn(
                                    "flex bg-gray-200 justify-between items-center py-2 px-3 rounded-md transition-colors",
                                    "hover:bg-accent/150",
                                    "even:bg-accent/100"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-amber-900 dark:text-foreground/80">{branchName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({percentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="w-32 h-2 rounded-full bg-accent/50 overflow-hidden">
                                      <div 
                                        className="h-full bg-primary/70 transition-all duration-500" 
                                        style={{ 
                                          width: `${percentage}%` 
                                        }} 
                                      />
                                    </div>
                                    <span className="font-medium text-amber-900 dark:text-foreground/90 tabular-nums w-16 text-right">
                                      {quantity.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                        })()}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GeneralOverview() {
  return <GeneralOverviewContent />;
} 