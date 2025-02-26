'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollAreaRoot } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CalendarIcon, Plus, Save, Share, Trash2 } from 'lucide-react';
import NeedsSelector from './NeedsSelector';
import ShareOptions from './ShareOptions';
import { cn } from '@/lib/utils';
import { 
  Need, 
  DailyNeedOrder, 
  getNeeds, 
  getDailyNeeds, 
  saveDailyNeeds, 
  formatDate,
  deleteDailyNeed
} from '@/lib/api/needs-api';

interface DailyNeed extends Need {
  quantity: string;
  total: string;
}

export default function NeedsStockContent() {
  const [date, setDate] = useState<Date>(new Date());
  const [needs, setNeeds] = useState<Need[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<DailyNeed[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNeedSelectorOpen, setIsNeedSelectorOpen] = useState(false);
  const [isShareOptionsOpen, setIsShareOptionsOpen] = useState(false);

  useEffect(() => {
    fetchNeeds();
  }, []);

  useEffect(() => {
    fetchDailyNeeds();
  }, [date]);

  const fetchNeeds = async () => {
    setIsLoading(true);
    try {
      const needsData = await getNeeds();
      setNeeds(needsData);
    } catch (error) {
      console.error('Ərzaqları yükləyərkən xəta:', error);
      toast.error('Ərzaqlar yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyNeeds = async () => {
    setIsLoading(true);
    try {
      const dailyNeedsData = await getDailyNeeds(date);
      
      // Günlük ihtiyaçları DailyNeed formatına dönüştür
      const formattedDailyNeeds: DailyNeed[] = dailyNeedsData.map(need => ({
        id: `${need.name}_${Date.now()}`, // Benzersiz ID
        name: need.name,
        price: need.price,
        unit: need.unit,
        quantity: need.quantity,
        total: need.totalPrice,
        createdAt: Date.now()
      }));

      setSelectedNeeds(formattedDailyNeeds);
    } catch (error) {
      console.error('Günlük ərzaqları yükləyərkən xəta:', error);
      toast.error('Günlük ərzaqlar yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNeed = (need: Need) => {
    const isAlreadySelected = selectedNeeds.some(n => n.name === need.name);
    if (isAlreadySelected) {
      toast.error('Bu məhsul artıq əlavə edilib');
      return;
    }

    const dailyNeed: DailyNeed = {
      ...need,
      quantity: '1',
      total: need.price
    };
    setSelectedNeeds(prev => [...prev, dailyNeed]);
    setIsNeedSelectorOpen(false);
  };

  const handleUpdateNeed = (need: DailyNeed) => {
    setSelectedNeeds(prev =>
      prev.map(n => (n.id === need.id ? need : n))
    );
  };

  const handleDeleteNeed = async (needId: string) => {
    if (window.confirm('Bu ərzaqı silmək istədiyinizə əminsiniz?')) {
      try {
        // Silinecek öğeyi bul
        const needToDelete = selectedNeeds.find(n => n.id === needId);
        if (!needToDelete) {
          toast.error('Silinəcək ərzaq tapılmadı');
          return;
        }
        
        // Önce UI'dan kaldır
        setSelectedNeeds(prev => prev.filter(n => n.id !== needId));
        
        // API ile silme işlemini gerçekleştir
        await deleteDailyNeed(date, needToDelete.name);
        
        toast.success('Ərzaq silindi');
      } catch (error) {
        console.error('Ərzaq silinərkən xəta:', error);
        toast.error('Ərzaq silinərkən xəta baş verdi');
        // Hata durumunda silinen öğeyi geri yükle
        await fetchDailyNeeds();
      }
    }
  };

  const calculateTotal = (price: string, quantity: string) => {
    const numPrice = parseFloat(price) || 0;
    const numQuantity = parseFloat(quantity) || 0;
    return (numPrice * numQuantity).toFixed(2);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const needsToSave = selectedNeeds.map(need => ({
        name: need.name,
        price: need.price,
        quantity: need.quantity,
        totalPrice: need.total,
        unit: need.unit
      }));

      await saveDailyNeeds(date, needsToSave);
      toast.success('Məlumatlar uğurla yadda saxlanıldı');
      await fetchDailyNeeds();
    } catch (error) {
      console.error('Məlumatları yadda saxlayarkən xəta:', error);
      toast.error('Məlumatlar yadda saxlanılarkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWhatsAppReport = () => {
    const totalAmount = selectedNeeds.reduce((sum, need) => sum + parseFloat(need.total || '0'), 0);
    
    let report = `🍪 *Günlük Ərzaq Hesabatı* 🍪\n`;
    report += `📅 Tarix: ${format(date, 'dd.MM.yyyy')}\n\n`;
    report += `📝 *Ərzaqlar:*\n`;
    
    selectedNeeds.forEach((need, index) => {
      report += `${index + 1}. ${need.name} 🛍️\n`;
      report += `   • Ərzaq Qiyməti: ${need.price} AZN ✨\n`;
      report += `   • Ərzaq Miqdarı: ${need.quantity} ${need.unit} 📦\n`;
      report += `   • Cəmi Toplam: ${need.total} AZN 💰\n\n`;
    });
    
    report += `\n💫 *Ümumi Məbləğ:* ${totalAmount.toFixed(2)} AZN`;
    
    return report;
  };

  const generatePDFReport = () => {
    const date = new Date();
    const currentDate = format(date, 'dd.MM.yyyy HH:mm');
    
    // Toplam tutarı hesapla
    const totalAmount = selectedNeeds.reduce((sum, need) => sum + parseFloat(need.total || '0'), 0);
    
    // Başlık ve genel bilgiler
    let report = `AIDA'S CORNER - ƏRZAQ HESABATI\n`;
    report += `=================================\n\n`;
    report += `Tarix: ${currentDate}\n`;
    report += `Hesabat dövrü: ${format(date, 'dd.MM.yyyy')}\n\n`;
    
    report += `ÜMUMI MƏLUMAT\n`;
    report += `-------------\n`;
    report += `Ərzaq növü: ${selectedNeeds.length}\n`;
    report += `Ümumi məbləğ: ${totalAmount.toFixed(2)} AZN\n\n`;
    
    // Tablo başlığı
    report += `ƏRZAQLAR\n`;
    report += `--------\n\n`;
    report += `No  Ərzaq adı                Qiymət      Miqdar      Vahid      Məbləğ\n`;
    report += `-------------------------------------------------------------------------------\n`;
    
    // Ürünleri sırala
    const sortedNeeds = [...selectedNeeds]
      .sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
    
    // Ürün detayları
    sortedNeeds.forEach((need, index) => {
      const no = (index + 1).toString().padEnd(3);
      const name = need.name.padEnd(25);
      const price = parseFloat(need.price).toFixed(2).padStart(8);
      const quantity = parseFloat(need.quantity).toFixed(2).padStart(10);
      const unit = need.unit.padEnd(10);
      const total = parseFloat(need.total).toFixed(2).padStart(10);
      
      report += `${no}${name}${price}${quantity}${unit}${total} AZN\n`;
    });
    
    report += `-------------------------------------------------------------------------------\n`;
    report += `                                                 ÜMUMI: ${totalAmount.toFixed(2)} AZN\n\n`;
    
    report += `Hesabat Aida's Corner tərəfindən yaradılıb\n`;
    report += `Çap tarixi: ${currentDate}`;
    
    return report;
  };

  // Toplam tutarı hesaplayan yardımcı fonksiyon
  const calculateTotalAmount = () => {
    return selectedNeeds.reduce((sum, need) => sum + parseFloat(need.total || '0'), 0).toFixed(2);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, 'dd MMMM yyyy', { locale: az })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {selectedNeeds.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-lg font-medium px-3 py-1.5 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md">
              Ümumi: {calculateTotalAmount()} AZN
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsShareOptionsOpen(true)}
                className="w-full sm:w-auto"
              >
                <Share className="mr-2 h-4 w-4" />
                Paylaş
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSave}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                Yadda saxla
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex-1 min-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedNeeds.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <div className="text-4xl mb-4">🍪</div>
                <p>Bu tarixdə heç bir ərzaq yoxdur</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsNeedSelectorOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ərzaq əlavə et
                </Button>
              </div>
            ) : (
              <>
                <ScrollAreaRoot className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {selectedNeeds.map((need) => (
                      <Card key={need.id} className=" dark:bg-gray-800 overflow-hidden border border-muted hover:border-muted-foreground/20 transition-all">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
                            <div className="flex items-center">
                              <div className="flex justify-center items-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 mr-3">
                                <span className="text-lg">🍪</span>
                              </div>
                              <h3 className="font-medium text-lg">{need.name}</h3>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 mt-2 sm:mt-0 sm:ml-auto">
                              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md">
                                <Input
                                  className="w-20 h-8 text-center bg-background border-0 focus-visible:ring-1"
                                  value={need.price}
                                  onChange={(e) => {
                                    const price = e.target.value;
                                    const updatedNeed = { 
                                      ...need, 
                                      price, 
                                      total: calculateTotal(price, need.quantity) 
                                    };
                                    handleUpdateNeed(updatedNeed);
                                  }}
                                  type="number"
                                  step="0.01"
                                />
                                <span className="text-sm font-medium">AZN</span>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md">
                                <Input
                                  className="w-20 h-8 text-center bg-background border-0 focus-visible:ring-1"
                                  value={need.quantity}
                                  onChange={(e) => {
                                    const quantity = e.target.value;
                                    const updatedNeed = { 
                                      ...need, 
                                      quantity, 
                                      total: calculateTotal(need.price, quantity) 
                                    };
                                    handleUpdateNeed(updatedNeed);
                                  }}
                                  type="number"
                                  step="0.01"
                                />
                                <span className="text-sm font-medium">{need.unit}</span>
                              </div>
                              
                              <div className="flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md">
                                <span className="font-medium">{need.total} AZN</span>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteNeed(need.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollAreaRoot>

                <div className="flex justify-between items-center mt-4">
                  <div></div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-16 w-16 p-0 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-800/30"
                    onClick={() => setIsNeedSelectorOpen(true)}
                  >
                    <Plus className="h-16 w-16 text-amber-700 dark:text-amber-300" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <NeedsSelector
        isOpen={isNeedSelectorOpen}
        onClose={() => setIsNeedSelectorOpen(false)}
        needs={needs}
        onSelectNeed={handleSelectNeed}
      />

      <ShareOptions
        isOpen={isShareOptionsOpen}
        onClose={() => setIsShareOptionsOpen(false)}
        whatsappReport={generateWhatsAppReport()}
        pdfReport={generatePDFReport()}
      />
    </div>
  );
} 