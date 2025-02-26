'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappReport: string;
  pdfReport: string;
}

export default function ShareOptions({ 
  isOpen, 
  onClose, 
  whatsappReport, 
  pdfReport 
}: ShareOptionsProps) {
  const [activeTab, setActiveTab] = useState('whatsapp');

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Mətn kopyalandı');
      })
      .catch(() => {
        toast.error('Mətn kopyalanarkən xəta baş verdi');
      });
  };

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(whatsappReport);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleDownloadPDF = () => {
    // Gerçek uygulamada PDF oluşturma ve indirme işlemi yapılacak
    toast.success('PDF yüklənir...');
    setTimeout(() => {
      toast.success('PDF uğurla yükləndi');
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hesabatı paylaş</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="whatsapp" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:data-[state=active]:bg-green-900/20 dark:data-[state=active]:text-green-300">
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800 dark:data-[state=active]:bg-red-900/20 dark:data-[state=active]:text-red-300">
              PDF
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="whatsapp" className="space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto border border-muted-foreground/10">
              {whatsappReport}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:hover:bg-green-900/20 dark:hover:text-green-300"
                onClick={() => handleCopyToClipboard(whatsappReport)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Kopyala
              </Button>
             {/*<Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleShareWhatsApp}
              >
                <Share2 className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>*/}
            </div>
          </TabsContent>
          
          <TabsContent value="pdf" className="space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto border border-muted-foreground/10 font-mono">
              {pdfReport}
            </div>
            
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDownloadPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF Yüklə
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 