'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollAreaRoot } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Store,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit,
  Cookie
} from 'lucide-react';
import { deleteBranchOrders, deleteProduct, updateProduct, addProductToBranch, fetchOrdersByDate } from '@/lib/firebase/orders';
import { PRODUCT_CORRECTIONS } from '@/utils/orderCorrection';

interface BranchSectionProps {
  branchName: string;
  products: Record<string, string>;
  selectedDate: Date;
  onDataChange: () => void;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productName: string, quantity: string) => void;
  initialProduct?: string;
  initialQuantity?: string;
  isNewProduct?: boolean;
}

function EditModal({ isOpen, onClose, onSave, initialProduct = '', initialQuantity = '', isNewProduct = false }: EditModalProps) {
  const [productName, setProductName] = useState(initialProduct);
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    if (isOpen) {
      setProductName(initialProduct);
      setQuantity(initialQuantity);
    }
  }, [isOpen, initialProduct, initialQuantity]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isNewProduct ? "Yeni Məhsul" : "Məhsulu Düzənlə"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Məhsul Adı</label>
            <Select
              value={productName}
              onValueChange={setProductName}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Məhsul seçin" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CORRECTIONS.map((product) => (
                  <SelectItem 
                    key={product.correct} 
                    value={product.correct}
                  >
                    {product.correct}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Miqdar</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İmtina
          </Button>
          <Button onClick={() => {
            onSave(productName, quantity);
            onClose();
          }}>
            Yadda Saxla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BranchSection({ branchName, products, selectedDate, onDataChange }: BranchSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{ name: string; quantity: string } | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
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

  const handleDeleteBranch = async () => {
    try {
      await deleteBranchOrders(selectedDate, branchName);
      onDataChange();
    } catch (error) {
      setAlertState({
        isOpen: true,
        status: 'error',
        title: 'Xəta',
        description: 'Məlumatları silmək mümkün olmadı'
      });
    }
  };

  const handleDeleteProduct = async (productName: string) => {
    try {
      await deleteProduct(selectedDate, branchName, productName);
      onDataChange();
      setAlertState({
        isOpen: true,
        status: 'success',
        title: 'Uğurlu',
        description: 'Məhsul uğurla silindi'
      });
    } catch (error) {
      setAlertState({
        isOpen: true,
        status: 'error',
        title: 'Xəta',
        description: 'Məhsulu silmək mümkün olmadı'
      });
    }
  };

  const handleEditProduct = (productName: string, quantity: string) => {
    setEditingProduct({ name: productName, quantity: quantity.toString() });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (newProductName: string, newQuantity: string) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct(
        selectedDate,
        branchName,
        editingProduct.name,
        newProductName,
        newQuantity
      );
      onDataChange();
      setEditModalVisible(false);
      setAlertState({
        isOpen: true,
        status: 'success',
        title: 'Uğurlu',
        description: 'Məhsul uğurla yeniləndi'
      });
    } catch (error) {
      setAlertState({
        isOpen: true,
        status: 'error',
        title: 'Xəta',
        description: 'Məhsulu yeniləmək mümkün olmadı'
      });
    }
  };

  const handleAddProduct = async (productName: string, quantity: string) => {
    try {
      await addProductToBranch(selectedDate, branchName, productName, quantity);
      onDataChange();
      setAddModalVisible(false);
      setAlertState({
        isOpen: true,
        status: 'success',
        title: 'Uğurlu',
        description: 'Məhsul uğurla əlavə edildi'
      });
    } catch (error) {
      setAlertState({
        isOpen: true,
        status: 'error',
        title: 'Xəta',
        description: 'Məhsul əlavə etmək mümkün olmadı'
      });
    }
  };

  return (
    <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-lg dark:bg-gray-800/90 dark:hover:shadow-gray-900/40">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer transition-colors duration-200 hover:bg-amber-50/50 dark:hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4 flex-1">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-gray-800 dark:to-gray-900 shadow-lg shadow-amber-100/50 dark:shadow-gray-900/40">
            <Store className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{branchName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {Object.keys(products).length} məhsul • {Object.values(products).reduce((acc, curr) => acc + Number(curr), 0)} ədəd
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-amber-100 dark:hover:bg-gray-700 dark:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              setAddModalVisible(true);
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 dark:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBranch();
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full hover:bg-amber-100 dark:hover:bg-gray-700 dark:text-gray-300"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-amber-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200 ">
          <div className="space-y-3">
            {Object.entries(products).map(([product, quantity]) => (
              <div
                key={product}
                className="flex items-center justify-between  dark:border dark:border-gray-900 p-3.5 rounded-xl bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg hover:shadow-amber-100/30 dark:hover:shadow-gray-900/40 transition-all duration-200"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-gray-800 shadow-sm">
                    <Cookie className="w-5 h-5 text-amber-500 dark:text-amber-500" />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-100">{product}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3.5 py-1.5 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 text-amber-700 dark:text-gray-300 font-medium shadow-sm dark:border dark:border-gray-700">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full hover:bg-amber-100 dark:hover:bg-gray-700 dark:text-gray-300"
                    onClick={() => handleEditProduct(product, quantity.toString())}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 dark:text-red-400"
                    onClick={() => handleDeleteProduct(product)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <EditModal
        isOpen={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveEdit}
        initialProduct={editingProduct?.name || ''}
        initialQuantity={editingProduct?.quantity || ''}
      />

      <EditModal
        isOpen={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddProduct}
        isNewProduct={true}
      />

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        status={alertState.status}
        title={alertState.title}
        description={alertState.description}
      />
    </Card>
  );
}

interface OrdersListProps {
  selectedDate: Date;
  onDataChange: () => void;
}

export function OrdersList({ selectedDate, onDataChange }: OrdersListProps) {
  const [ordersData, setOrdersData] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrdersByDate(selectedDate);
      setOrdersData(data || {});
    } catch (error) {
      console.error('Sifarişləri yükləmək mümkün olmadı:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleDataChange = () => {
    fetchData();
    onDataChange();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!ordersData || Object.keys(ordersData).length === 0) {
    return (
      <Card className="min-h-[400px] max-h-[80vh] p-8 flex items-center justify-center bg-white dark:bg-gray-900 border-amber-100 dark:border-gray-800">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-full bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-gray-800 dark:to-gray-900 w-fit mx-auto shadow-lg shadow-amber-100/50 dark:shadow-gray-900/40">
            <Store className="w-8 h-8 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Məlumat tapılmadı
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Bu tarix üçün heç bir sifariş yoxdur
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <ScrollAreaRoot className="min-h-[400px] max-h-[80vh] overflow-y-auto rounded-lg bg-white/50 dark:bg-gray-900 dark:shadow-gray-900/40">
      <div className="space-y-4 p-4 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-gray-700 scrollbar-track-amber-50 dark:scrollbar-track-gray-800">
        {Object.entries(ordersData).map(([branchName, products]) => (
          <BranchSection
            key={branchName}
            branchName={branchName}
            products={products}
            selectedDate={selectedDate}
            onDataChange={handleDataChange}
          />
        ))}
      </div>
    </ScrollAreaRoot>
  );
} 