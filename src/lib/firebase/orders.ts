import { doc, collection, deleteDoc, updateDoc, setDoc, getDocs, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export async function fetchOrdersByDate(date: Date) {
  try {
    // Tarihi dd.mm.yyyy formatına çevir
    const formattedDate = formatDate(date);
    console.log('Fetching orders for date:', formattedDate);

    // orders/[date]/branches koleksiyonuna eriş
    const ordersRef = doc(db, 'orders', formattedDate);
    const branchesRef = collection(ordersRef, 'branches');
    const branchesSnapshot = await getDocs(branchesRef);

    // Her şube için ürünleri topla
    const ordersData: Record<string, Record<string, string>> = {};
    
    branchesSnapshot.forEach((branchDoc) => {
      // Şube adı ve ürünleri al
      const branchName = branchDoc.id;
      const products = branchDoc.data();
      
      // Ürünleri string olarak sakla
      ordersData[branchName] = Object.entries(products).reduce((acc, [product, quantity]) => {
        acc[product] = quantity.toString();
        return acc;
      }, {} as Record<string, string>);
    });

    return ordersData;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function deleteBranchOrders(date: Date, branchName: string) {
  const formattedDate = formatDate(date);
  const dateDocRef = doc(db, 'orders', formattedDate);
  const branchDocRef = doc(collection(dateDocRef, 'branches'), branchName);
  
  await deleteDoc(branchDocRef);
}

export async function deleteProduct(date: Date, branchName: string, productName: string) {
  const formattedDate = formatDate(date);
  const dateDocRef = doc(db, 'orders', formattedDate);
  const branchDocRef = doc(collection(dateDocRef, 'branches'), branchName);
  
  await updateDoc(branchDocRef, {
    [productName]: deleteField()
  });
}

export async function updateProduct(
  date: Date,
  branchName: string,
  oldProductName: string,
  newProductName: string,
  newQuantity: string
) {
  const formattedDate = formatDate(date);
  const dateDocRef = doc(db, 'orders', formattedDate);
  const branchDocRef = doc(collection(dateDocRef, 'branches'), branchName);
  
  const updates: Record<string, any> = {};
  
  if (oldProductName !== newProductName) {
    updates[oldProductName] = deleteField();
    updates[newProductName] = parseFloat(newQuantity);
  } else {
    updates[oldProductName] = parseFloat(newQuantity);
  }
  
  await updateDoc(branchDocRef, updates);
}

export async function addProductToBranch(
  date: Date,
  branchName: string,
  productName: string,
  quantity: string
) {
  const formattedDate = formatDate(date);
  const dateDocRef = doc(db, 'orders', formattedDate);
  const branchDocRef = doc(collection(dateDocRef, 'branches'), branchName);
  
  await setDoc(branchDocRef, {
    [productName]: parseFloat(quantity)
  }, { merge: true });
} 