'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchOrdersByDate } from '@/lib/api/orders';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { XCircle, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';

interface OrdersData {
  [branchName: string]: {
    [productName: string]: number;
  };
}

interface OrdersCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onDataChange: () => void;
}

export function OrdersCalendar({ selectedDate, onDateChange, onDataChange }: OrdersCalendarProps) {
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrdersByDate(selectedDate);
      setOrdersData(data);
      setError(null);
    } catch (error) {
      setError('Sifarişləri yükləyərkən xəta baş verdi');
      setAlertState({
        isOpen: true,
        status: 'error',
        title: 'Xəta',
        description: 'Sifarişləri yükləyərkən xəta baş verdi'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedDate]);

  if (loading) {
    return (
      <Button
        variant="outline"
        size="default"
        className="h-10 px-4 py-2 bg-transparent border border-amber-200/50 dark:border-amber-800/50 animate-pulse"
        disabled
      >
        <div className="w-24 h-4 bg-amber-100 dark:bg-amber-900/20 rounded" />
      </Button>
    );
  }

  if (error) {
    return (
      <Button
        variant="outline"
        size="default"
        className="h-10 px-4 py-2 bg-transparent border border-red-200 dark:border-red-800 hover:bg-red-50/50 dark:hover:bg-red-900/20"
        onClick={loadOrders}
      >
        <XCircle className="w-4 h-4 mr-2 text-red-500" />
        <span className="text-sm font-medium text-red-600 dark:text-red-400">
          Yenidən cəhd et
        </span>
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className={`
            h-10 px-4 py-2
            bg-amber-50 dark:bg-amber-950/40
            border border-amber-200/50 dark:border-amber-800/50
            hover:bg-amber-100 dark:hover:bg-amber-900/40
            transition-all duration-200
            ${isOpen ? 'bg-amber-50/50 dark:bg-amber-950/60 shadow-sm dark:shadow-amber-900/10' : ''}
          `}
        >
          <CalendarIcon className={`
            w-4 h-4 mr-2 
            transition-colors duration-200
            ${isOpen ? 'text-amber-600 dark:text-amber-400' : 'text-amber-600/80 dark:text-amber-500/80'}
          `} />
          <time className={`
            text-sm font-medium 
            transition-colors duration-200
            ${isOpen ? 'text-amber-900 dark:text-amber-100' : 'text-amber-900/90 dark:text-amber-200/90'}
          `}>
            {format(selectedDate, 'd MMMM yyyy', { locale: az })}
          </time>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="center"
        sideOffset={4}
      >
        <div className="p-4 bg-gradient-to-br from-amber-50/80 to-amber-100/80 dark:from-amber-950/90 dark:to-amber-900/90 backdrop-blur-sm rounded-lg border border-amber-100 dark:border-amber-800/50 shadow-xl dark:shadow-amber-900/20">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateChange(date);
                onDataChange();
                setIsOpen(false);
              }
            }}
            initialFocus
            locale={az}
            className="rounded-md bg-transparent border-0"
            components={{
              IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-amber-600/80 dark:text-amber-400/80" />,
              IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-amber-600/80 dark:text-amber-400/80" />,
            }}
            classNames={{
              day_selected: "relative bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 text-white hover:from-amber-600 hover:to-amber-700 dark:hover:from-amber-500 dark:hover:to-amber-600 focus:from-amber-600 focus:to-amber-700 rounded-full font-medium shadow-sm scale-90",
              day_today: "relative bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800/40 dark:to-amber-700/40 text-amber-900 dark:text-amber-100 font-medium rounded-full ring-1 ring-amber-200 dark:ring-amber-700/50 scale-90",
              day_outside: "text-gray-400 dark:text-gray-600 opacity-50 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 rounded-full scale-90",
              day: "relative h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-amber-50 dark:hover:bg-amber-800/20 rounded-full transition-all duration-200 hover:scale-100 focus:scale-100 scale-90 text-amber-900 dark:text-amber-100",
              nav_button: "h-7 w-7 bg-transparent hover:bg-amber-50 dark:hover:bg-amber-800/20 rounded-full transition-all duration-200 hover:scale-110",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              caption: "relative py-5 pl-3 pr-3 text-center font-medium text-amber-900 dark:text-amber-100",
              head_cell: "text-amber-600/60 dark:text-amber-400/60 font-medium text-[11px] uppercase tracking-wider text-center w-8",
              cell: "p-0 relative [&:has([aria-selected])]:bg-amber-600/5 dark:[&:has([aria-selected])]:bg-amber-400/10 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20 text-center",
              table: "border-collapse w-full",
              months: "space-y-4",
              month: "space-y-3",
              row: "flex w-full mt-1 justify-around",
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
} 