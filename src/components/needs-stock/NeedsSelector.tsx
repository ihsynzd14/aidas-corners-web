'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollAreaRoot } from '@/components/ui/scroll-area';
import { Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Need {
  id: string;
  name: string;
  price: string;
  unit: string;
  createdAt: number;
}

interface NeedsSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  needs: Need[];
  onSelectNeed: (needs: Need[]) => void;
  initialSelectedNeeds?: Need[];
}

export default function NeedsSelector({ 
  isOpen, 
  onClose, 
  needs, 
  onSelectNeed, 
  initialSelectedNeeds = [] 
}: NeedsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<Need[]>(initialSelectedNeeds);

  // Dialog açıldığında seçili öğeleri sıfırla
  useEffect(() => {
    if (isOpen) {
      setSelectedNeeds(initialSelectedNeeds);
      console.log('NeedsSelector açıldı, başlangıç seçimleri:', initialSelectedNeeds);
    }
  }, [isOpen, initialSelectedNeeds]);

  const filteredNeeds = needs.filter(need => 
    need.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNeedToggle = (need: Need) => {
    console.log('Öğe seçimi değişti:', need);
    setSelectedNeeds(prev => {
      const isSelected = prev.some(item => item.id === need.id);
      if (isSelected) {
        const newSelection = prev.filter(item => item.id !== need.id);
        console.log('Öğe kaldırıldı, yeni seçim:', newSelection);
        return newSelection;
      } else {
        const newSelection = [...prev, need];
        console.log('Öğe eklendi, yeni seçim:', newSelection);
        return newSelection;
      }
    });
  };

  const handleConfirm = () => {
    console.log('Onaylanan seçimler:', selectedNeeds);
    onSelectNeed(selectedNeeds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ərzaq seçin</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ərzaq axtar..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollAreaRoot className="h-[300px] mt-2">
          <div className="space-y-2">
            {filteredNeeds.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                Ərzaq tapılmadı
              </div>
            ) : (
              filteredNeeds.map((need) => {
                const isSelected = selectedNeeds.some(item => item.id === need.id);
                return (
                  <div
                    key={need.id}
                    className={`flex items-center p-3 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer transition-colors ${isSelected ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                    onClick={() => handleNeedToggle(need)}
                  >
                    <div className="flex justify-center items-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 mr-3">
                      {isSelected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span>🍪</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{need.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <span className="font-medium text-amber-700 dark:text-amber-300">{need.price} AZN</span>
                        <span>/</span>
                        <span>{need.unit}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollAreaRoot>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>İmtina</Button>
          <Button onClick={handleConfirm} disabled={selectedNeeds.length === 0}>
            {selectedNeeds.length > 0 ? `${selectedNeeds.length} ərzaq seçildi` : 'Seçin'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 