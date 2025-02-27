import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Store, ShoppingBag, ShoppingCart } from 'lucide-react';

interface MarketSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMarket: (market: string) => void;
  markets: string[];
}

export default function MarketSelector({
  isOpen,
  onClose,
  onSelectMarket,
  markets
}: MarketSelectorProps) {
  // Market ikonlarını belirle
  const getMarketIcon = (market: string) => {
    switch (market) {
      case 'Altınoğulları':
        return <ShoppingBag className="h-5 w-5" />;
      case 'Araz Market':
        return <ShoppingCart className="h-5 w-5" />;
      default:
        return <Store className="h-5 w-5" />;
    }
  };

  // Market renklerini belirle
  const getMarketColor = (market: string) => {
    switch (market) {
      case 'Altınoğulları':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/30';
      case 'Araz Market':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800/40 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Hansı marketdən alış etdiniz?</DialogTitle>
          <DialogDescription>
            Ərzaqların hansı marketdən alındığını seçin
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          {markets.map((market) => {
            const colorClass = getMarketColor(market);
            return (
              <Button
                key={market}
                variant="outline"
                className={`h-20 flex items-center justify-start gap-3 border-2 hover:border-current transition-all ${colorClass}`}
                onClick={() => onSelectMarket(market)}
              >
                <div className={`flex justify-center items-center w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm`}>
                  {getMarketIcon(market)}
                </div>
                <span className="text-lg font-medium">{market}</span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
} 