import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface BranchQuantity {
  branchName: string;
  quantity: number;
}

interface ReportStats {
  totalProducts: number;
  totalQuantity: number;
  totalBranches: number;
  maxQuantity: number;
  minQuantity: number;
}

export const formatDateString = (date: Date) => {
  return format(date, 'd MMMM yyyy', { locale: az });
};

export const formatWhatsAppMessage = (
  totals: { [key: string]: number }, 
  totalProducts: number, 
  totalQuantity: number, 
  totalBranches: number
) => {
  const date = formatDateString(new Date());
  const message = [
    "Aida's Corner - Gündəlik Sifariş Hesabatı",
    `\u{1F4C5} ${date}`,
    "",
    `\u{1F4E6} Ümumi Məhsullar: ${totalProducts} növ`,
    `\u{1F4CA} Ümumi Miqdar: ${totalQuantity} ədəd`,
    `\u{1F3EA} Ümumi Şöbə: ${totalBranches}`,
    "",
    "Məhsullar üzrə bölgü:",
    ...Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([product, quantity]) => `\u{2022} ${product}: ${quantity} ədəd`)
  ].join('\n');

  return message;
};

const encodeAzeri = (text: string) => {
  return text
    .replace(/ə/g, 'e')
    .replace(/Ə/g, 'E')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
};

export const generatePDF = (
  totals: { [key: string]: number }, 
  totalProducts: number, 
  totalQuantity: number, 
  totalBranches: number,
  ordersData: Record<string, Record<string, string>>
) => {
  const getBranchQuantities = (productName: string): BranchQuantity[] => {
    const quantities: BranchQuantity[] = [];
    if (!ordersData) return quantities;

    Object.entries(ordersData).forEach(([branchName, products]) => {
      Object.entries(products).forEach(([product, quantity]) => {
        if (product.toLowerCase() === productName.toLowerCase()) {
          quantities.push({
            branchName,
            quantity: parseFloat(quantity.toString())
          });
        }
      });
    });
    return quantities.sort((a, b) => b.quantity - a.quantity);
  };

  const doc = new jsPDF('p', 'pt', 'a4');

  // Calculate statistics
  const stats: ReportStats = {
    totalProducts,
    totalQuantity,
    totalBranches,
    maxQuantity: Math.max(...Object.values(totals)),
    minQuantity: Math.min(...Object.values(totals))
  };

  // Helper function to encode Azerbaijani text for PDF
  const encodeForPDF = (text: string) => {
    return encodeAzeri(text);
  };

  // Header Section
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, doc.internal.pageSize.width, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text("Aida's Corner", doc.internal.pageSize.width / 2, 25, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(encodeForPDF("Gundelik Sifaris Hesabati"), doc.internal.pageSize.width / 2, 45, { align: 'center' });

  // Date and General Info
  const date = formatDateString(new Date());
  const startY = 70;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`Tarix: ${encodeForPDF(date)}`, doc.internal.pageSize.width / 2, startY, { align: 'center' });

  // Statistics Grid
  const statsData = [
    [encodeForPDF('Umumi Mehsullar'), `${stats.totalProducts} nov`],
    [encodeForPDF('Umumi Miqdar'), `${stats.totalQuantity} eded`],
    [encodeForPDF('Umumi Sobe'), `${stats.totalBranches}`],
    [encodeForPDF('En Cox Sifaris'), `${stats.maxQuantity} eded`],
    [encodeForPDF('En Az Sifaris'), `${stats.minQuantity} eded`]
  ];

  const pageWidth = doc.internal.pageSize.width;
  const tableWidth = 400; // Smaller width for statistics table
  const marginLeft = (pageWidth - tableWidth) / 2;

  (doc as any).autoTable({
    startY: startY + 10,
    head: [[encodeForPDF('Gosterici'), encodeForPDF('Deyer')]],
    body: statsData,
    theme: 'grid',
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 10,
      cellPadding: 8,
      font: 'helvetica',
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 250 },
      1: { cellWidth: 150, halign: 'right' }
    },
    margin: { left: marginLeft }
  });

  // Branch Details
  // Reset table width for other tables
  const detailsTableWidth = 500;
  const detailsMarginLeft = (pageWidth - detailsTableWidth) / 2;
  let currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(encodeForPDF('Sobeler uzre hesabat'), detailsMarginLeft, currentY);

  Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([product, totalQuantity]) => {
      const branchQuantities = getBranchQuantities(product);
      if (branchQuantities.length > 0) {
        if (currentY > doc.internal.pageSize.height - 100) {
          doc.addPage();
          currentY = 30;
        }

        (doc as any).autoTable({
          startY: currentY + 10,
          head: [[
            encodeForPDF(product + ` (Cemi: ${totalQuantity} eded)`), 
            encodeForPDF('Miqdar'), 
            'Faiz'
          ]],
          body: branchQuantities.map(bq => [
            encodeForPDF(bq.branchName),
            `${bq.quantity} eded`,
            `${((bq.quantity / totals[product]) * 100).toFixed(1)}%`
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [245, 158, 11],
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10,
            cellPadding: 5,
            font: 'helvetica'
          },
          columnStyles: {
            0: { cellWidth: 300 },
            1: { cellWidth: 100, halign: 'center' },
            2: { cellWidth: 100, halign: 'center' }
          },
          margin: { left: detailsMarginLeft }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      }
    });

  // Products Summary (on the last page)
  doc.addPage();
  currentY = startY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(encodeForPDF('Mehsullar uzre umumi hesabat'), detailsMarginLeft, currentY);

  const tableData = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([product, quantity]) => [
      encodeForPDF(product),
      `${quantity} eded`,
      `${((quantity / totalQuantity) * 100).toFixed(1)}%`
    ]);

  (doc as any).autoTable({
    startY: currentY + 10,
    head: [[encodeForPDF('Mehsul'), encodeForPDF('Miqdar'), 'Faiz']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      font: 'helvetica'
    },
    columnStyles: {
      0: { cellWidth: 300 },
      1: { cellWidth: 100, halign: 'center' },
      2: { cellWidth: 100, halign: 'center' }
    },
    margin: { left: detailsMarginLeft }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      encodeForPDF(`Sehife ${i} / ${pageCount}`),
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 20,
      { align: 'right' }
    );
    doc.text(
      encodeForPDF(`${date} tarixinde yaradilib`),
      30,
      doc.internal.pageSize.height - 20
    );
  }

  doc.save(`Aidas_Corner_Sifarisler_${encodeForPDF(date)}.pdf`);
}; 