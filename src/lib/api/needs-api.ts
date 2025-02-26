import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Cache yönetimi için basit bir mekanizma
let cache: Record<string, any> = {};

export function clearCache() {
  cache = {};
}

export function setCache(key: string, data: any) {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
}

export function getCache(key: string, maxAge = 5 * 60 * 1000) {
  const cached = cache[key];
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > maxAge) {
    delete cache[key];
    return null;
  }
  
  return cached.data;
}

export interface Need {
  id: string;
  name: string;
  price: string;
  unit: string;
  createdAt: number;
}

export interface DailyNeedOrder {
  name: string;
  price: string;
  quantity: string;
  totalPrice: string;
  unit: string;
}

// Needs koleksiyonu için fonksiyonlar
export async function addNeed(need: Omit<Need, 'id' | 'createdAt'>): Promise<void> {
  try {
    const needRef = doc(db, 'needs', need.name);
    await setDoc(needRef, {
      id: need.name,
      ...need,
      createdAt: Date.now()
    });
    
    // Cache'i temizle
    clearCache();
  } catch (error) {
    console.error('Error adding need:', error);
    throw error;
  }
}

export async function updateNeed(needId: string, updates: Partial<Omit<Need, 'id'>>): Promise<void> {
  try {
    const needRef = doc(db, 'needs', needId);
    await updateDoc(needRef, updates);
    clearCache();
  } catch (error) {
    console.error('Error updating need:', error);
    throw error;
  }
}

export async function deleteNeed(needId: string): Promise<void> {
  try {
    const needRef = doc(db, 'needs', needId);
    await deleteDoc(needRef);
    clearCache();
  } catch (error) {
    console.error('Error deleting need:', error);
    throw error;
  }
}

export async function getNeeds(): Promise<Need[]> {
  try {
    // Önce cache'e bakalım
    const cachedNeeds = getCache('needs');
    if (cachedNeeds) return cachedNeeds;
    
    const needsRef = collection(db, 'needs');
    const q = query(needsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const needs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Need[];
    
    setCache('needs', needs);
    return needs;
  } catch (error) {
    console.error('Error getting needs:', error);
    throw error;
  }
}

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export async function saveDailyNeeds(date: Date, needs: DailyNeedOrder[]): Promise<void> {
  try {
    const dateStr = formatDate(date); // "DD.MM.YYYY" formatında
    const needsRef = collection(db, 'needOrders', dateStr, 'needs_list');
    
    const batch = writeBatch(db);

    // Önce mevcut belgeleri silelim
    const existingDocs = await getDocs(needsRef);
    existingDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Yeni belgeleri ekleyelim
    needs.forEach((need) => {
      const needDoc = doc(needsRef);
      batch.set(needDoc, {
        name: need.name,
        price: need.price,
        quantity: need.quantity,
        totalPrice: need.totalPrice,
        unit: need.unit,
        createdAt: Date.now()
      });
    });

    await batch.commit();
    clearCache();
  } catch (error) {
    console.error('Error saving daily needs:', error);
    throw error;
  }
}

export async function getDailyNeeds(date: Date): Promise<DailyNeedOrder[]> {
  try {
    const dateStr = formatDate(date); // "DD.MM.YYYY" formatında
    const cacheKey = `dailyNeeds_${dateStr}`;
    
    // Önce cache'e bakalım
    const cachedNeeds = getCache(cacheKey);
    if (cachedNeeds) return cachedNeeds;
    
    const needsRef = collection(db, 'needOrders', dateStr, 'needs_list');
    const q = query(needsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const dailyNeeds = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
        unit: data.unit
      } as DailyNeedOrder;
    });
    
    setCache(cacheKey, dailyNeeds);
    return dailyNeeds;
  } catch (error) {
    console.error('Error getting daily needs:', error);
    return []; // Hata durumunda boş array dön
  }
}

// Günlük ihtiyaçlardan belirli bir öğeyi silme fonksiyonu
export async function deleteDailyNeed(date: Date, needName: string): Promise<void> {
  try {
    const dateStr = formatDate(date);
    const needsRef = collection(db, 'needOrders', dateStr, 'needs_list');
    
    // Önce mevcut belgeleri al
    const querySnapshot = await getDocs(needsRef);
    
    // Silinecek belgeyi bul
    const needToDelete = querySnapshot.docs.find(doc => doc.data().name === needName);
    
    if (needToDelete) {
      // Belgeyi sil
      await deleteDoc(needToDelete.ref);
      
      // Cache'i temizle
      const cacheKey = `dailyNeeds_${dateStr}`;
      clearCache();
    } else {
      throw new Error('Silinecek ərzaq tapılmadı');
    }
  } catch (error) {
    console.error('Error deleting daily need:', error);
    throw error;
  }
} 