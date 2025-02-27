'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollAreaRoot } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CalendarIcon, Plus, Save, Share, Trash2, Store } from 'lucide-react';
import NeedsSelector from './NeedsSelector';
import ShareOptions from './ShareOptions';
import MarketSelector from './MarketSelector';
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

// Market türleri
const MARKETS = {
  ALTIN: 'Altınoğulları',
  ARAZ: 'Araz Market',
  OTHER: 'Diğer'
};

interface DailyNeed extends Need {
  quantity: string;
  total: string;
  market: string; // Market bilgisi eklendi
}

export default function NeedsStockContent() {
  const [date, setDate] = useState<Date>(new Date());
  const [needs, setNeeds] = useState<Need[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<DailyNeed[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNeedSelectorOpen, setIsNeedSelectorOpen] = useState(false);
  const [isShareOptionsOpen, setIsShareOptionsOpen] = useState(false);
  const [isMarketSelectorOpen, setIsMarketSelectorOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [selectedNeedsForMarket, setSelectedNeedsForMarket] = useState<Need[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

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
      const formattedDailyNeeds: DailyNeed[] = dailyNeedsData.map(need => {
        const market = need.market || MARKETS.OTHER;
        return {
          id: generateUniqueId(need.name, market), // Yardımcı fonksiyonu kullan
          name: need.name,
          price: need.price,
          unit: need.unit,
          quantity: need.quantity,
          total: need.totalPrice,
          createdAt: Date.now(),
          market: market // Market bilgisi yoksa "Diğer" olarak ayarla
        };
      });

      setSelectedNeeds(formattedDailyNeeds);
    } catch (error) {
      console.error('Günlük ərzaqları yükləyərkən xəta:', error);
      toast.error('Günlük ərzaqlar yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddButtonClick = () => {
    // Market seçim dialogunu aç
    setIsMarketSelectorOpen(true);
  };

  const handleMarketSelect = (market: string) => {
    setSelectedMarket(market);
    setIsMarketSelectorOpen(false);
    // Market seçildikten sonra ihtiyaç seçim dialogunu aç
    setIsNeedSelectorOpen(true);
  };

  const handleSelectNeed = (selectedItems: Need[]) => {
    console.log('NeedsSelector\'dan gelen seçimler:', selectedItems);
    setSelectedNeedsForMarket(selectedItems);
    
    // Seçilen her öğeyi işle
    const newNeeds = selectedItems.filter(need => {
      // Zaten eklenmiş öğeleri kontrol et
      const isAlreadyAdded = selectedNeeds.some(n => n.name === need.name && n.market === selectedMarket);
      console.log(`Öğe "${need.name}" zaten eklenmiş mi:`, isAlreadyAdded);
      return !isAlreadyAdded;
    }).map(need => {
      // Price değerini kontrol et ve formatla
      const price = formatDecimalInput(need.price || "0");
      
      // Benzersiz ID oluştur - market bilgisini ekle
      const uniqueId = generateUniqueId(need.name, selectedMarket);
      
      const dailyNeed = {
        ...need,
        id: uniqueId, // Benzersiz ID
        price, // Formatlanmış price değeri
        quantity: '1',
        total: price, // Total değeri de price ile aynı olacak (quantity 1 olduğu için)
        market: selectedMarket // Seçilen market bilgisini ekle
      };
      console.log('Yeni DailyNeed oluşturuldu:', dailyNeed);
      return dailyNeed;
    });

    console.log('Eklenecek yeni öğeler:', newNeeds);
    
    if (newNeeds.length === 0) {
      console.log('Eklenecek yeni öğe yok');
      toast.error('Seçilən məhsullar artıq əlavə edilib');
      return;
    }

    // Yeni öğeleri ekle
    setSelectedNeeds(prev => {
      const updatedNeeds = [...prev, ...newNeeds];
      console.log('Güncellenmiş öğe listesi:', updatedNeeds);
      return updatedNeeds;
    });
    
    // Dialog'u kapat
    setIsNeedSelectorOpen(false);
    
    // Otomatik kaydet
    setTimeout(() => {
      saveNeeds(newNeeds);
    }, 500);
  };

  // Yeni öğeleri kaydetmek için yardımcı fonksiyon
  const saveNeeds = async (newNeeds: DailyNeed[]) => {
    setIsLoading(true);
    try {
      // Mevcut öğeleri al
      const currentNeeds = [...selectedNeeds];
      
      // Tüm öğeleri birleştir
      const allNeeds = [...currentNeeds, ...newNeeds];
      
      // Kaydetmek için dönüştür
      const needsToSave = allNeeds.map(need => ({
        name: need.name,
        price: need.price,
        quantity: need.quantity,
        totalPrice: need.total,
        unit: need.unit,
        market: need.market // Market bilgisini ekle
      }));

      console.log('Otomatik kaydedilecek veriler:', needsToSave);
      
      await saveDailyNeeds(date, needsToSave);
      toast.success('Məlumatlar uğurla yadda saxlanıldı');
      
      // Güncel verileri yeniden yükle
      await fetchDailyNeeds();
    } catch (error) {
      console.error('Otomatik kaydetme hatası:', error);
      toast.error('Məlumatlar yadda saxlanılarkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNeed = (need: DailyNeed) => {
    // Price ve quantity değerlerini formatla
    need.price = formatDecimalInput(need.price);
    need.quantity = formatDecimalInput(need.quantity);
    
    // Total değerini hesapla
    need.total = calculateTotal(need.price, need.quantity);
    
    setSelectedNeeds(prev =>
      prev.map(n => (n.id === need.id ? need : n))
    );
  };

  const handleDeleteNeed = async (needId: string) => {
    if (window.confirm('Bu ərzaqı silmək istədiyinizə əminsiniz?')) {
      try {
        setIsLoading(true);
        
        // Silinecek öğeyi bul
        const needToDelete = selectedNeeds.find(n => n.id === needId);
        if (!needToDelete) {
          toast.error('Silinəcək ərzaq tapılmadı');
          return;
        }
        
        // Güncel listeyi oluştur
        const updatedNeeds = selectedNeeds.filter(n => n.id !== needId);
        
        // Kaydetmek için dönüştür
        const needsToSave = updatedNeeds.map(need => ({
          name: need.name,
          price: need.price,
          quantity: need.quantity,
          totalPrice: need.total,
          unit: need.unit,
          market: need.market
        }));
        
        // Veritabanına kaydet
        await saveDailyNeeds(date, needsToSave);
        
        // UI'ı güncelle
        setSelectedNeeds(updatedNeeds);
        
        toast.success('Ərzaq silindi və dəyişikliklər yadda saxlanıldı');
      } catch (error) {
        console.error('Ərzaq silinərkən xəta:', error);
        toast.error('Ərzaq silinərkən xəta baş verdi');
        // Hata durumunda güncel verileri yeniden yükle
        await fetchDailyNeeds();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const calculateTotal = (price: string, quantity: string) => {
    // Boş değerleri kontrol et
    if (!price || price === '0' || !quantity || quantity === '0') return '0.00';
    
    // Virgül yerine nokta kullanarak sayıya çevir
    const numPrice = parseFloat(price.replace(',', '.')) || 0;
    const numQuantity = parseFloat(quantity.replace(',', '.')) || 0;
    
    // Hesaplamayı yap ve 2 ondalık basamakla formatla
    const total = numPrice * numQuantity;
    return total.toFixed(2);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('Seçilen öğeler:', selectedNeeds);
      
      const needsToSave = selectedNeeds.map(need => ({
        name: need.name,
        price: need.price,
        quantity: need.quantity,
        totalPrice: need.total,
        unit: need.unit,
        market: need.market // Market bilgisini ekle
      }));

      console.log('Kaydedilecek veriler:', needsToSave);
      console.log('Tarih:', date, formatDate(date));
      
      try {
        await saveDailyNeeds(date, needsToSave);
        console.log('Veriler başarıyla kaydedildi');
      } catch (saveError) {
        console.error('saveDailyNeeds hatası:', saveError);
        throw saveError;
      }
      
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
    
    // Marketlere göre grupla
    const marketGroups = Object.keys(groupedNeeds);
    
    for (const market of marketGroups) {
      const marketNeeds = groupedNeeds[market];
      const marketTotal = calculateMarketTotal(market);
      
      report += `🏪 *${market}* - ${marketTotal} AZN\n\n`;
      report += `📝 *Ərzaqlar:*\n`;
      
      marketNeeds.forEach((need, index) => {
        report += `${index + 1}. ${need.name} 🛍️\n`;
        report += `   • Ərzaq Qiyməti: ${need.price} AZN ✨\n`;
        report += `   • Ərzaq Miqdarı: ${need.quantity} ${need.unit} 📦\n`;
        report += `   • Cəmi Toplam: ${need.total} AZN 💰\n\n`;
      });
      
      report += `\n`;
    }
    
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
    report += `Market sayı: ${Object.keys(groupedNeeds).length}\n`;
    report += `Ümumi məbləğ: ${totalAmount.toFixed(2)} AZN\n\n`;
    
    // Marketlere göre grupla ve her market için ayrı tablo oluştur
    for (const market of Object.keys(groupedNeeds)) {
      const marketNeeds = groupedNeeds[market];
      const marketTotal = calculateMarketTotal(market);
      
      report += `MARKET: ${market.toUpperCase()}\n`;
      report += `===================\n`;
      report += `Ərzaq sayı: ${marketNeeds.length}\n`;
      report += `Toplam məbləğ: ${marketTotal} AZN\n\n`;
      
      // Tablo başlığı
      report += `ƏRZAQLAR\n`;
      report += `--------\n\n`;
      report += `No  Ərzaq adı                Qiymət      Miqdar      Vahid      Məbləğ\n`;
      report += `-------------------------------------------------------------------------------\n`;
      
      // Ürünleri sırala
      const sortedNeeds = [...marketNeeds]
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
      report += `                                                 TOPLAM: ${marketTotal} AZN\n\n\n`;
    }
    
    report += `===============================================================================\n`;
    report += `                                                 ÜMUMI: ${totalAmount.toFixed(2)} AZN\n\n`;
    
    report += `Hesabat Aida's Corner tərəfindən yaradılıb\n`;
    
    return report;
  };

  // Markete göre öğeleri grupla
  const groupedNeeds = selectedNeeds.reduce((acc, need) => {
    const market = need.market || MARKETS.OTHER;
    if (!acc[market]) {
      acc[market] = [];
    }
    acc[market].push(need);
    return acc;
  }, {} as Record<string, DailyNeed[]>);

  // Benzersiz ID oluşturmak için yardımcı fonksiyon
  const generateUniqueId = (name: string, market: string): string => {
    return `${name}_${market}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Markete göre toplam tutarı hesapla
  const calculateMarketTotal = (market: string) => {
    const marketNeeds = groupedNeeds[market] || [];
    return marketNeeds.reduce((sum, need) => sum + parseFloat(need.total || '0'), 0).toFixed(2);
  };

  // Tüm marketlerin toplam tutarını hesapla
  const calculateTotalAmount = () => {
    return selectedNeeds.reduce((sum, need) => sum + parseFloat(need.total || '0'), 0).toFixed(2);
  };

  // Yardımcı fonksiyon: Sadece sayılar ve tek bir nokta içeren string döndürür
  const formatDecimalInput = (value: string): string => {
    // Virgülü noktaya çevir
    let formatted = value.replace(/,/g, '.');
    
    // Sadece sayılar ve nokta karakterine izin ver
    formatted = formatted.replace(/[^0-9.]/g, '');
    
    // Birden fazla nokta varsa, sadece ilkini koru
    const dots = formatted.match(/\./g);
    if (dots && dots.length > 1) {
      const parts = formatted.split('.');
      formatted = parts[0] + '.' + parts.slice(1).join('');
    }
    
    return formatted || "0";
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
                  onClick={handleAddButtonClick}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ərzaq əlavə et
                </Button>
              </div>
            ) : (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="all" className="text-sm">
                      Hamısı
                    </TabsTrigger>
                    <TabsTrigger value={MARKETS.ALTIN} className="text-sm">
                      {MARKETS.ALTIN}
                    </TabsTrigger>
                    <TabsTrigger value={MARKETS.ARAZ} className="text-sm">
                      {MARKETS.ARAZ}
                    </TabsTrigger>
                    <TabsTrigger value={MARKETS.OTHER} className="text-sm">
                      {MARKETS.OTHER}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-0">
                    <ScrollAreaRoot className="h-[600px] pr-4">
                      <div className="space-y-6">
                        {Object.keys(groupedNeeds).map(market => (
                          <Card key={market} className="overflow-hidden border-0 shadow-md">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 py-3">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center">
                                  <Store className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                                  {market}
                                </CardTitle>
                                <div className="text-sm font-medium bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                                  {calculateMarketTotal(market)} AZN
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {groupedNeeds[market].map((need) => (
                                  <div key={need.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
                                              const price = formatDecimalInput(e.target.value);
                                              const updatedNeed = { 
                                                ...need, 
                                                price
                                              };
                                              handleUpdateNeed(updatedNeed);
                                            }}
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0"
                                          />
                                          <span className="text-sm font-medium">AZN</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md">
                                          <Input
                                            className="w-20 h-8 text-center bg-background border-0 focus-visible:ring-1"
                                            value={need.quantity}
                                            onChange={(e) => {
                                              const quantity = formatDecimalInput(e.target.value);
                                              const updatedNeed = { 
                                                ...need, 
                                                quantity
                                              };
                                              handleUpdateNeed(updatedNeed);
                                            }}
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0"
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
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollAreaRoot>
                  </TabsContent>

                  {[MARKETS.ALTIN, MARKETS.ARAZ, MARKETS.OTHER].map(marketName => (
                    <TabsContent key={marketName} value={marketName} className="mt-0">
                      <ScrollAreaRoot className="h-[600px] pr-4">
                        <div className="space-y-3">
                          {(groupedNeeds[marketName] || []).map((need) => (
                            <Card key={need.id} className="overflow-hidden border border-muted hover:border-muted-foreground/20 transition-all">
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
                                          const price = formatDecimalInput(e.target.value);
                                          const updatedNeed = { 
                                            ...need, 
                                            price
                                          };
                                          handleUpdateNeed(updatedNeed);
                                        }}
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                      />
                                      <span className="text-sm font-medium">AZN</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md">
                                      <Input
                                        className="w-20 h-8 text-center bg-background border-0 focus-visible:ring-1"
                                        value={need.quantity}
                                        onChange={(e) => {
                                          const quantity = formatDecimalInput(e.target.value);
                                          const updatedNeed = { 
                                            ...need, 
                                            quantity
                                          };
                                          handleUpdateNeed(updatedNeed);
                                        }}
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
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
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="fixed bottom-8 right-8 z-50">
                  <Button
                    variant="default"
                    size="icon"
                    className="rounded-full h-16 w-16 p-0 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={handleAddButtonClick}
                  >
                    <Plus className="h-8 w-8" />
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
        initialSelectedNeeds={selectedNeedsForMarket}
      />

      <MarketSelector
        isOpen={isMarketSelectorOpen}
        onClose={() => setIsMarketSelectorOpen(false)}
        onSelectMarket={handleMarketSelect}
        markets={[MARKETS.ALTIN, MARKETS.ARAZ, MARKETS.OTHER]}
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