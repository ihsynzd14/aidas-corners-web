'use client';

import { useState } from 'react';
import { Order } from '@/types/order';
import { updateOrderStatus, deleteOrder } from '@/lib/api/orders';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckIcon, 
  ClockIcon, 
  XMarkIcon,
  EllipsisHorizontalIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  pending: {
    label: 'Gözləyir',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    icon: ClockIcon,
  },
  processing: {
    label: 'Hazırlanır',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    icon: ClockIcon,
  },
  completed: {
    label: 'Tamamlandı',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    icon: CheckIcon,
  },
  cancelled: {
    label: 'Ləğv edildi',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    icon: XMarkIcon,
  },
};

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    setIsLoading(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      toast({
        title: 'Uğurlu',
        description: 'Sifariş statusu yeniləndi',
      });
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: 'Status yenilənərkən xəta baş verdi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu sifarişi silmək istədiyinizdən əminsiniz?')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteOrder(order.id);
      toast({
        title: 'Uğurlu',
        description: 'Sifariş silindi',
      });
    } catch (error) {
      console.error('Delete order error:', error);
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: 'Sifariş silinərkən xəta baş verdi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Sifariş #{order.id.slice(-4)}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isLoading}>
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusUpdate('processing')}>
              Hazırlanmaya başla
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate('completed')}>
              Tamamlandı olaraq işarələ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate('cancelled')}>
              Ləğv et
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Badge className={status.color}>
            <StatusIcon className="h-4 w-4 mr-1" />
            {status.label}
          </Badge>
          <div className="space-y-2">
            {order.products.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{product.name}</span>
                <span className="text-sm font-medium">
                  {product.quantity} {product.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500 dark:text-gray-400">
        Tarix: {new Date(order.date).toLocaleDateString('az-AZ')}
      </CardFooter>
    </Card>
  );
} 