'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { addOrder } from '@/lib/api/orders';
import { useToast } from '@/hooks/use-toast';
import { getBranches } from '@/lib/firebase/config';
import { Branch } from '@/types/branch';
import { correctOrderText } from '@/utils/orderCorrection';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { PlusCircle } from 'lucide-react';

export default function CreateOrderButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [orderText, setOrderText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    status: 'success' | 'error';
    title: string;
    description: string;
  }>({
    isOpen: false,
    status: 'success',
    title: '',
    description: ''
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await getBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error('Error loading branches:', error);
        toast({
          variant: 'destructive',
          title: 'Xəta',
          description: 'Filiallar yüklənərkən xəta baş verdi',
        });
      }
    };

    if (isOpen) {
      loadBranches();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (orderText.trim()) {
      const corrected = correctOrderText(orderText);
      setCorrectedText(corrected);
    } else {
      setCorrectedText('');
    }
  }, [orderText]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBranch || !orderText.trim()) return;

    setIsLoading(true);
    try {
      const orders = correctedText.split('\n').filter(line => line.trim());
      const formattedDate = format(selectedDate, 'dd.MM.yyyy');
      
      for (const orderLine of orders) {
        const [product, quantityPart] = orderLine.split(' - ').map(part => part.trim());
        const quantity = parseFloat(quantityPart.split(' ')[0]);

        await addOrder(formattedDate, {
          branch: selectedBranch,
          product,
          quantity
        });
      }

      setAlertState({
        isOpen: true,
        status: 'success',
        title: 'Uğurlu!',
        description: 'Yeni sifariş uğurla yaradıldı'
      });

      await new Promise(resolve => setTimeout(resolve, 3500));
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setAlertState({
        isOpen: true,
        status: 'error',
        title: 'Xəta!',
        description: 'Sifariş yaradılarkən xəta baş verdi'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-white hover:bg-blue-200 dark:bg-gray-400 dark:hover:bg-gray-700 dark:text-gray-900 text-gray-600">
          <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Sifariş
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Yeni Sifariş</DialogTitle>
            <DialogDescription>
              Yeni sifariş yaratmaq üçün aşağıdakı məlumatları doldurun
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Sifariş Tarixi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'PPP', { locale: az })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Filial</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filial seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={`${branch.type} ${branch.name}`}>
                        {branch.type} {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>WhatsApp Sifarişi</Label>
                <Textarea
                  value={orderText}
                  onChange={(e) => setOrderText(e.target.value)}
                  placeholder="WhatsApp sifarişini buraya yapışdırın..."
                  className="min-h-[200px]"
                  disabled={isLoading}
                />
              </div>

              {correctedText && orderText !== correctedText && (
                <div className="space-y-2">
                  <Label>Düzəldilmiş Mətn</Label>
                  <div className="rounded-md bg-muted p-4">
                    <pre className="text-sm whitespace-pre-wrap">{correctedText}</pre>
                  </div>
                </div>
              )}
            </form>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isLoading || !selectedBranch || !orderText.trim()}>
              {isLoading ? 'Yaradılır...' : 'Yarat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={handleCloseAlert}
        status={alertState.status}
        title={alertState.title}
        description={alertState.description}
      />
    </>
  );
} 