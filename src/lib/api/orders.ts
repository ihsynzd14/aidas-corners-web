import { Order, OrderFormData, OrderStatus } from '@/types/order';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  getFirestore
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface OrderItem {
  branch: string;
  product: string;
  quantity: number;
}

export async function addOrder(date: string, order: OrderItem): Promise<void> {
  try {
    const formattedDate = date;
    const dateDocRef = doc(db, 'orders', formattedDate);
    const branchDocRef = doc(collection(dateDocRef, 'branches'), order.branch);
    
    // Batch write kullan
    const batch = writeBatch(db);
    batch.set(branchDocRef, {
      [order.product]: order.quantity
    }, { merge: true });
    
    await batch.commit();
  } catch (error) {
    console.error('Sifariş əlavə edilərkən xəta:', error);
    throw error;
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Sifarişlər yüklənərkən xəta:', error);
    throw new Error('Sifarişlər yüklənərkən xəta baş verdi');
  }
}

export async function getOrder(id: string): Promise<Order> {
  try {
    const orderRef = doc(db, 'orders', id);
    const snapshot = await getDocs(query(collection(db, 'orders'), where('id', '==', id)));
    
    if (snapshot.empty) {
      throw new Error('Sifariş tapılmadı');
    }

    const orderDoc = snapshot.docs[0];
    return {
      id: orderDoc.id,
      ...orderDoc.data()
    } as Order;
  } catch (error) {
    console.error('Sifariş yüklənərkən xəta:', error);
    throw new Error('Sifariş yüklənərkən xəta baş verdi');
  }
}

export async function createOrder(data: OrderFormData): Promise<Order> {
  try {
    const ordersRef = collection(db, 'orders');
    const orderDoc = doc(ordersRef);
    const orderData: Order = {
      id: orderDoc.id,
      branchId: data.branchId,
      date: data.date,
      products: data.products,
      status: 'pending',
      createdAt: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString(),
    };

    await setDoc(orderDoc, orderData);
    return orderData;
  } catch (error) {
    console.error('Sifariş yaradılarkən xəta:', error);
    throw new Error('Sifariş yaradılarkən xəta baş verdi');
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  try {
    const orderRef = doc(db, 'orders', id);
    const updateData = {
      status,
      updatedAt: Timestamp.now().toDate().toISOString(),
    };

    await updateDoc(orderRef, updateData);
    
    // Güncellenmiş siparişi getir
    const updatedOrder = await getOrder(id);
    return updatedOrder;
  } catch (error) {
    console.error('Sifariş statusu yenilənərkən xəta:', error);
    throw new Error('Sifariş statusu yenilənərkən xəta baş verdi');
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', id);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Sifariş silinərkən xəta:', error);
    throw new Error('Sifariş silinərkən xəta baş verdi');
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function fetchOrdersByDate(date: Date) {
  const db = getFirestore();
  const formattedDate = formatDate(date);
  
  try {
    console.log('Fetching orders for date:', formattedDate);
    
    const dateDocRef = doc(db, 'orders', formattedDate);
    const branchesRef = collection(dateDocRef, 'branches');
    const branchesSnapshot = await getDocs(branchesRef);
    
    const ordersData: { [key: string]: any } = {};
    branchesSnapshot.docs.forEach(branchDoc => {
      ordersData[branchDoc.id] = branchDoc.data();
    });
    
    return ordersData;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
} 