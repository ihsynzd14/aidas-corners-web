import { format } from 'date-fns';

interface Product {
  name: string;
  totalQuantity: number;
  branchQuantities: {
    [key: string]: number;
  };
}

interface Branch {
  branchId: string;
  branchName: string;
  date: string;
  products: {
    [key: string]: string;
  };
}

interface ApiResponse {
  [key: string]: Branch[];
}

const formatWhatsAppMessage = (
  productMap: Map<string, { total: number; branches: Map<string, number> }>,
  totalQuantity: number,
  activeBranchCount: number,
  dateRangeKey: string,
  branchNames: string[]
): string => {
  const date = new Date();
  const timeStr = date.toLocaleTimeString('az-AZ', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
  const currentDate = `${format(date, 'dd.MM.yyyy')} ${timeStr}`;

  // Ana bilgiler
  const header = [
    "🏪 Aida's Corner - Məhsul Statistikası",
    `📅 Tarix: ${currentDate}`,
    `📊 Hesabat dövrü: ${dateRangeKey}`,
    "",
    "📌 Ümumi Məlumat:",
    `• Məhsul növü: ${productMap.size}`,
    `• Ümumi miqdar: ${totalQuantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ədəd`,
    `• Aktiv şöbə: ${activeBranchCount}`,
    "",
    "🔍 Məhsullar üzrə detallı bölgü:",
    ""
  ].join('\n');

  // Ürünleri toplam miktara göre sırala
  const sortedProducts = Array.from(productMap.entries())
    .sort(([, a], [, b]) => b.total - a.total);

  // Ürün detayları
  const details = sortedProducts
    .filter(([, { total }]) => total > 0)
    .map(([name, { total, branches }], index) => {
      const branchDetails = Array.from(branches.entries())
        .sort(([, a], [, b]) => b - a)
        .filter(([, quantity]) => quantity > 0)
        .map(([branchName, quantity]) => {
          const percentage = ((quantity / total) * 100).toFixed(1);
          return `   • ${branchName}: ${quantity.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} (${percentage} faiz)`;
        })
        .join('\n');

      return [
        `${index + 1}. ${name}`,
        `   📦 Ümumi: ${total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ədəd`,
        branchDetails,
        "" // Her ürün sonrası boş satır
      ].join('\n');
    })
    .join('\n');

  const footer = `\n📝 Hesabat Aida's Corner tərəfindən yaradılıb\n\n`;

  // Mesajı birleştir ve doğrudan dön
  return `${header}${details}${footer}`;
};

export function generateGeneralReport(data: ApiResponse): string {
  const dateRangeKey = Object.keys(data)[0];
  const branches = data[dateRangeKey];

  // Ürünleri ve miktarları topla
  const productMap = new Map<string, { total: number, branches: Map<string, number> }>();

  // Ürün adını normalize et - boşlukları temizle
  const normalizeProductName = (name: string) => name.trim();

  // Sadece şube verilerini işle (total hariç)
  const regularBranches = branches.filter(b => b.branchId !== 'total');
  const branchNames = regularBranches.map(b => b.branchName);

  // Debug için total verisi
  const totalBranch = branches.find(b => b.branchId === 'total');
  console.log('Total branch data:', totalBranch?.products);

  regularBranches.forEach(branch => {
    console.log(`Processing branch: ${branch.branchName}`);
    Object.entries(branch.products).forEach(([name, quantity]) => {
      const normalizedName = normalizeProductName(name);
      console.log(`  Product: ${normalizedName}, Quantity: ${quantity}`);
      
      if (!productMap.has(normalizedName)) {
        productMap.set(normalizedName, {
          total: 0,
          branches: new Map()
        });
      }
      
      const product = productMap.get(normalizedName)!;
      const qtyNum = parseFloat(quantity);
      
      // Toplam miktarı güncelle
      product.total += qtyNum;
      
      // Şube miktarını güncelle
      const existingQty = product.branches.get(branch.branchName) || 0;
      product.branches.set(branch.branchName, existingQty + qtyNum);
    });
  });

  // Debug için hesaplanan toplamları kontrol et
  console.log('\nCalculated totals:');
  productMap.forEach((value, key) => {
    console.log(`${key}: ${value.total}`);
    console.log('Branch distribution:');
    value.branches.forEach((qty, branch) => {
      console.log(`  ${branch}: ${qty}`);
    });
  });

  // Toplam şube sayısını bul
  const activeBranchCount = regularBranches.length;

  // Toplam ürün miktarını hesapla
  const totalQuantity = Array.from(productMap.values()).reduce(
    (sum, { total }) => sum + total,
    0
  );

  return formatWhatsAppMessage(productMap, totalQuantity, activeBranchCount, dateRangeKey, branchNames);
} 