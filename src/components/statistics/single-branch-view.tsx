'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { AlertCircle, BarChart3, Loader2, Search, RefreshCcw } from 'lucide-react';
import { fetchOrders } from '@/lib/api/detailed-overview';
import { Branch } from '@/types/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRODUCT_CORRECTIONS } from '@/utils/orderCorrection';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SingleBranchView() {
  const [date, setDate] = useLocalStorage<DateRange | undefined>('single-branch-date-range', undefined);
  const [selectedBranch, setSelectedBranch] = useLocalStorage<string>('single-branch-selected-branch', '');
  const [selectedProduct, setSelectedProduct] = useLocalStorage<string>('single-branch-selected-product', 'all');
  const [activeTab, setActiveTab] = useLocalStorage<string>('single-branch-active-tab', 'branch');
  const [searchTerm, setSearchTerm] = useLocalStorage<string>('single-branch-search-term', '');
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (date?.from && date?.to) {
      fetchData();
    }
  }, [date]);

  useEffect(() => {
    // Reset selected product when switching tabs
    if (activeTab === 'branch') {
      setSelectedProduct('all');
    } else {
      setSelectedBranch('');
    }
  }, [activeTab, setSelectedProduct, setSelectedBranch]);

  const fetchData = async (showToast = false) => {
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
      const allBranches = data[dateRangeKey].filter(b => b.branchId !== 'total');
      
      setBranches(allBranches);
      if (!selectedBranch && allBranches.length > 0) {
        setSelectedBranch(allBranches[0].branchId);
      }

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
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const selectedBranchData = branches.find(b => b.branchId === selectedBranch);
  const allProducts = branches.flatMap(branch =>
    Object.entries(branch.products).map(([name, quantity]) => ({
      name,
      quantity: parseFloat(quantity),
      branch: branch.branchName
    }))
  );

  const filteredProducts = activeTab === 'branch'
    ? (selectedBranchData
        ? Object.entries(selectedBranchData.products)
            .map(([name, quantity]) => ({
              name,
              quantity: parseFloat(quantity),
              branch: selectedBranchData.branchName
            }))
            .filter(product =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => b.quantity - a.quantity)
        : [])
    : allProducts
        .filter(product => {
          const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesSelected = selectedProduct === 'all' || product.name === selectedProduct;
          return matchesSearch && matchesSelected;
        })
        .sort((a, b) => b.quantity - a.quantity);

  const maxQuantity = Math.max(...filteredProducts.map(p => p.quantity));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-end gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold text-amber-900">Tarix aralığı seçin</h2>
            <div className="flex gap-2 items-center text-amber-900">
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

        {branches.length > 0 && (
          <div className="w-full md:w-[300px] space-y-2">
            {activeTab === 'branch' ? (
              <>
                <h2 className="text-xl font-semibold text-amber-900">Filial seçin</h2>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger className="bg-card border-border/40 text-amber-900">
                    <SelectValue placeholder="Filial seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.branchId} value={branch.branchId}>
                        {branch.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-amber-900">Məhsul seçin</h2>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="text-amber-900 bg-card border-border/40 ">
                    <SelectValue placeholder="Məhsul seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Bütün məhsullar</SelectItem>
                    {PRODUCT_CORRECTIONS.map((product) => (
                      <SelectItem key={product.correct} value={product.correct}>
                        {product.correct}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Xəta</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AnimatePresence mode="wait">
        {branches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[700px]"
          >
            <Card className="h-full border-border/40 bg-card/50">
              <CardHeader className="space-y-4 border-b border-border/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-900" />
                    <span className="text-amber-900">Məhsul Statistikası</span>
                  </CardTitle>
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Məhsul axtar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-card border-border/40"
                      />
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-[400px]">
                      <TabsList className="grid w-full grid-cols-2 bg-card/50">
                        <TabsTrigger value="branch" className="data-[state=active]:bg-primary/20">
                          Filial üzrə
                        </TabsTrigger>
                        <TabsTrigger value="product" className="data-[state=active]:bg-primary/20">
                          Məhsul üzrə
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollAreaPrimitive.Root className="h-[600px] w-full overflow-hidden" type="always">
                  <ScrollAreaPrimitive.Viewport className="h-full w-full ">
                    <div className="space-y-4 p-6">
                      {filteredProducts.map((product) => (
                        <motion.div
                          key={`${product.name}-${product.branch}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <span className="font-medium text-amber-900">{product.name}</span>
                              {activeTab === 'product' && (
                                <p className="text-sm text-amber-900/70">
                                  {product.branch}
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-medium text-amber-900">
                              {product.quantity.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={(product.quantity / maxQuantity) * 100}
                            className="h-2 bg-accent [&>[role=progressbar]]:bg-amber-900"
                           
                          />
                        </motion.div>
                      ))}
                    </div>
                  </ScrollAreaPrimitive.Viewport>
                  <ScrollAreaPrimitive.Scrollbar
                    className="flex select-none touch-none p-0.5 bg-accent/50 transition-colors duration-150 ease-out hover:bg-accent data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                    orientation="vertical"
                  >
                    <ScrollAreaPrimitive.Thumb className="flex-1 bg-border/50 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                  </ScrollAreaPrimitive.Scrollbar>
                </ScrollAreaPrimitive.Root>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 