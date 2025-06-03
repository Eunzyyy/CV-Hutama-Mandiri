// src/app/api/finance/payments/[id]/invoice/route.ts - LAYOUT TABLE & SIGNATURE DIPERBAIKI
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import jsPDF from 'jspdf';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "FINANCE", "OWNER", "CUSTOMER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const paymentId = parseInt(params.id);
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                phoneNumber: true,
                address: true
              }
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true
                  }
                },
                service: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek akses customer
    if (session.user.role === "CUSTOMER" && payment.order.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // ✅ RESPONSIVE LAYOUT CONSTANTS
    const pageWidth = 210; // A4 width
    const pageHeight = 297; // A4 height
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // ✅ HEADER SECTION - REDUCED HEIGHT (tanpa customer info)
    const headerHeight = 45; // Dikurangi karena customer info dipindah
    
    // Load logo dengan error handling
    try {
      const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-hutama.png');
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      doc.addImage(logoBase64, 'PNG', margin, margin, 25, 25);
    } catch (error) {
      // Simple logo placeholder yang tidak akan overlap
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.circle(margin + 12.5, margin + 12.5, 12);
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text('LOGO', margin + 9, margin + 14);
    }
    
    // ✅ COMPANY INFO - FULL WIDTH (tanpa customer info di kanan)
    const companyStartX = margin + 35;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('CV HUTAMA MANDIRI INDOTECH', companyStartX, margin + 8);
    
    doc.setFontSize(10);
    doc.setTextColor(220, 20, 60);
    doc.text('SPECIALIST CNC PRECISION PRODUCT', companyStartX, margin + 15);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text('Jl. Raya Binong No. 79 Kamp. Parigi Sukabakti, Curug', companyStartX, margin + 22);
    doc.text('Tangerang 15810 Telp. 021 - 5983117', companyStartX, margin + 28);
    
    // ✅ SEPARATOR LINE - DINAIKKAN KE ATAS
    const separatorY = margin + headerHeight - 8; // Dinaikkan dari -5 ke -8
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, separatorY, pageWidth - margin, separatorY);
    
    // ✅ TITLE SECTION
    const titleY = separatorY + 12;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const fakturTitle = 'INVOICE';
    const fakturWidth = doc.getTextWidth(fakturTitle);
    doc.text(fakturTitle, (pageWidth - fakturWidth) / 2, titleY);
    
    // ✅ CUSTOMER INFO - DIPINDAH KE SINI (SEBELUM TANGGAL FAKTUR)
    const customerInfoY = titleY + 12;
    
    const currentDate = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const paymentDate = payment.paidAt ? new Date(payment.paidAt) : new Date(payment.createdAt);
    const paymentDateStr = `${paymentDate.getDate()} ${months[paymentDate.getMonth()]} ${paymentDate.getFullYear()}`;
    
    const orderDate = new Date(payment.order.createdAt);
    const dueDate = new Date(orderDate);
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateStr = `${dueDate.getDate()} ${months[dueDate.getMonth()]} ${dueDate.getFullYear()}`;
    
    // Customer info di kiri
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text('Kepada Yth.', margin, customerInfoY);
    doc.text(`Up ${payment.order.user.name}`, margin, customerInfoY + 6);
    doc.text('Tangerang', margin, customerInfoY + 12);
    
    // ✅ INVOICE INFO SECTION - DISESUAIKAN POSISINYA
    const infoY = customerInfoY + 20; // Diberi space setelah customer info
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text('TGL Faktur    :', margin, infoY);
    doc.text(paymentDateStr, margin + 25, infoY);
    doc.text('No. Faktur    :', margin, infoY + 6);
    doc.text(`${payment.order.orderNumber}/HMI/IX/${paymentDate.getFullYear()}`, margin + 25, infoY + 6);
    doc.text('Jatuh Tempo :', margin, infoY + 12);
    doc.text(dueDateStr, margin + 25, infoY + 12);
    
    // ✅ DYNAMIC TABLE - RESPONSIVE & ADAPTIVE
    const tableStartY = infoY + 20;
    const itemCount = payment.order.orderItems.length;
    const rowHeight = 10; // ✅ DIPERBESAR UNTUK KONSISTENSI (dari 8 ke 10)
    const headerHeight_table = 12; // ✅ DIPERBESAR UNTUK HEADER (dari 10 ke 12)
    
    // ✅ OPTIMIZED COLUMN WIDTHS - RESPONSIVE
    const tableWidth = contentWidth;
    const colWidths = {
      qty: 20,        // Qty - lebih sempit
      namaBarang: tableWidth - 80,  // Nama Barang - flexible
      hargaSatuan: 30, // Harga Satuan
      jumlah: 30      // Jumlah
    };
    
    // Calculate column positions
    const colPositions = {
      qty: margin,
      namaBarang: margin + colWidths.qty,
      hargaSatuan: margin + colWidths.qty + colWidths.namaBarang,
      jumlah: margin + colWidths.qty + colWidths.namaBarang + colWidths.hargaSatuan
    };
    
    // ✅ DYNAMIC TABLE HEIGHT - HANYA UNTUK ITEMS (TANPA TOTAL)
    const tableContentHeight = (itemCount * rowHeight);
    const itemsTableHeight = headerHeight_table + tableContentHeight;
    
    // ✅ TABLE STRUCTURE - HANYA UNTUK ITEMS
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    
    // Main table rectangle - hanya untuk items
    doc.rect(margin, tableStartY, tableWidth, itemsTableHeight);
    
    // Vertical lines
    doc.line(colPositions.namaBarang, tableStartY, colPositions.namaBarang, tableStartY + itemsTableHeight);
    doc.line(colPositions.hargaSatuan, tableStartY, colPositions.hargaSatuan, tableStartY + itemsTableHeight);
    doc.line(colPositions.jumlah, tableStartY, colPositions.jumlah, tableStartY + itemsTableHeight);
    
    // Header separator
    doc.line(margin, tableStartY + headerHeight_table, pageWidth - margin, tableStartY + headerHeight_table);
    
    // ✅ TABLE HEADERS - CENTERED IN COLUMNS
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    
    const headers = ['Qty', 'Nama Barang / Jasa', 'Harga Satuan', 'Jumlah'];
    const headerY = tableStartY + 8; // ✅ DISESUAIKAN DENGAN HEADER HEIGHT BARU
    
    // Center each header in its column
    doc.text('Qty', colPositions.qty + (colWidths.qty / 2) - (doc.getTextWidth('Qty') / 2), headerY);
    doc.text('Nama Barang / Jasa', colPositions.namaBarang + (colWidths.namaBarang / 2) - (doc.getTextWidth('Nama Barang / Jasa') / 2), headerY);
    doc.text('Harga Satuan', colPositions.hargaSatuan + (colWidths.hargaSatuan / 2) - (doc.getTextWidth('Harga Satuan') / 2), headerY);
    doc.text('Jumlah', colPositions.jumlah + (colWidths.jumlah / 2) - (doc.getTextWidth('Jumlah') / 2), headerY);
    
    // ✅ TABLE CONTENT - DYNAMIC ROWS DENGAN TINGGI KONSISTEN
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    let totalAmount = 0;
    
    payment.order.orderItems.forEach((item, index) => {
      const itemName = item.product?.name || item.service?.name || 'Unknown Item';
      const itemSku = item.product?.sku || '';
      const itemPrice = item.price;
      const itemQty = item.quantity;
      const subtotal = itemQty * itemPrice;
      totalAmount += subtotal;
      
      // ✅ POSITIONING YANG KONSISTEN - SETIAP BARIS TINGGINYA SAMA
      const rowStartY = tableStartY + headerHeight_table + (index * rowHeight);
      const rowCenterY = rowStartY + (rowHeight / 2) + 1; // Center vertical dalam baris
      
      // ✅ GARIS HORIZONTAL UNTUK SETIAP BARIS (KECUALI YANG TERAKHIR)
      if (index < itemCount - 1) {
        doc.setLineWidth(0.2);
        doc.setDrawColor(200, 200, 200); // Garis abu-abu tipis
        doc.line(margin, rowStartY + rowHeight, pageWidth - margin, rowStartY + rowHeight);
      }
      
      // ✅ QTY - CENTERED VERTIKAL DAN HORIZONTAL
      const qtyText = `${itemQty}`;
      doc.text(qtyText, colPositions.qty + (colWidths.qty / 2) - (doc.getTextWidth(qtyText) / 2), rowCenterY);
      
      // ✅ NAMA BARANG - LEFT ALIGNED WITH PADDING & VERTICAL CENTER
      let fullItemName = itemName.toUpperCase();
      if (itemSku) fullItemName += ` ${itemSku}`;
      
      // Smart truncation based on column width
      const maxChars = Math.floor(colWidths.namaBarang / 3); // Rough estimate
      let displayName = fullItemName;
      if (fullItemName.length > maxChars) {
        displayName = fullItemName.substring(0, maxChars - 3) + '...';
      }
      doc.text(displayName, colPositions.namaBarang + 2, rowCenterY);
      
      // ✅ HARGA SATUAN - RIGHT ALIGNED IN COLUMN & VERTICAL CENTER
      const priceText = `${itemPrice.toLocaleString('id-ID')}`;
      doc.text(priceText, colPositions.hargaSatuan + colWidths.hargaSatuan - 2 - doc.getTextWidth(priceText), rowCenterY);
      
      // ✅ JUMLAH - RIGHT ALIGNED IN COLUMN & VERTICAL CENTER
      const totalText = `${subtotal.toLocaleString('id-ID')}`;
      doc.text(totalText, colPositions.jumlah + colWidths.jumlah - 2 - doc.getTextWidth(totalText), rowCenterY);
    });
    
    // ✅ GARIS AKHIR ITEM - SETELAH ITEM TERAKHIR
    const itemEndY = tableStartY + itemsTableHeight;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, itemEndY, pageWidth - margin, itemEndY);
    
    // ✅ TOTAL SECTION - TERPISAH DARI TABLE (TIDAK MENGIKUTI KOLOM)
    const totalSectionY = itemEndY + 8;
    const totalBoxWidth = 60; // Lebar box total
    const totalBoxHeight = 15; // Tinggi box total
    const totalBoxX = pageWidth - margin - totalBoxWidth; // Posisi di kanan
    
    // Box untuk total
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.rect(totalBoxX, totalSectionY, totalBoxWidth, totalBoxHeight);
    
    // Garis tengah untuk memisahkan label dan nilai
    doc.line(totalBoxX, totalSectionY + 8, totalBoxX + totalBoxWidth, totalSectionY + 8);
    
    // Label TOTAL
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const totalLabel = 'TOTAL';
    const totalLabelWidth = doc.getTextWidth(totalLabel);
    doc.text(totalLabel, totalBoxX + (totalBoxWidth / 2) - (totalLabelWidth / 2), totalSectionY + 6);
    
    // Nilai Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const grandTotalText = `Rp ${totalAmount.toLocaleString('id-ID')}`;
    const grandTotalWidth = doc.getTextWidth(grandTotalText);
    doc.text(grandTotalText, totalBoxX + (totalBoxWidth / 2) - (grandTotalWidth / 2), totalSectionY + 13);
    
    // ✅ SIGNATURE SECTION - FONT DIPERBESAR & SIGNATURE DIPERBESAR
    const signatureStartY = totalSectionY + totalBoxHeight + 20;
    const availableSpace = pageHeight - signatureStartY - 40; // Reserve space for footer
    
    // Only add signatures if there's enough space
    if (availableSpace > 50) {
      const signatureSpacing = contentWidth / 3;
      const leftSigX = margin + signatureSpacing / 2;
      const rightSigX = margin + (signatureSpacing * 2);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12); // ✅ DIPERBESAR DARI 9 KE 12
      
      // Signature labels - FONT DIPERBESAR
      doc.text('Yang Menerima', leftSigX - (doc.getTextWidth('Yang Menerima') / 2), signatureStartY);
      doc.text('Hormat Kami', rightSigX - (doc.getTextWidth('Hormat Kami') / 2), signatureStartY);
      
      // ✅ LOAD SIGNATURE - DIPERBESAR & DISESUAIKAN POSISI
      try {
        const signaturePath = path.join(process.cwd(), 'public', 'images', 'signature.png');
        const signatureBuffer = fs.readFileSync(signaturePath);
        const signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;
        
        // ✅ SIGNATURE DIPERBESAR - LEBAR 50MM, TINGGI 35MM
        // Posisi disesuaikan agar signature mentok ke garis bawah dan hormat kami
        const sigWidth = 50;
        const sigHeight = 35;
        const sigX = rightSigX - (sigWidth / 2); // Center horizontal dengan "Hormat Kami"
        const sigY = signatureStartY + 2; // Mulai dari bawah "Hormat Kami"
        
        doc.addImage(signatureBase64, 'PNG', sigX, sigY, sigWidth, sigHeight);
      } catch (error) {
        doc.setFontSize(10); // ✅ PLACEHOLDER FONT DIPERBESAR
        doc.setTextColor(150, 150, 150);
        doc.text('(Tanda Tangan)', rightSigX - (doc.getTextWidth('(Tanda Tangan)') / 2), signatureStartY + 20);
      }
      
      // ✅ SIGNATURE LINES - DIPERPANJANG DAN DISESUAIKAN
      const lineY = signatureStartY + 40; // ✅ DISESUAIKAN DENGAN SIGNATURE YANG LEBIH BESAR
      doc.setLineWidth(0.2);
      doc.setDrawColor(0, 0, 0);
      doc.setTextColor(0, 0, 0);
      
      // Garis tanda tangan diperpanjang
      doc.line(leftSigX - 25, lineY, leftSigX + 25, lineY);
      doc.line(rightSigX - 25, lineY, rightSigX + 25, lineY);
      
      // ✅ NAME PLACEHOLDERS - FONT DIPERBESAR
      doc.setFontSize(10); // ✅ DIPERBESAR DARI 7 KE 10
      doc.text('(.....................)', leftSigX - (doc.getTextWidth('(.....................)') / 2), lineY + 5);
      doc.text('Pembeli', leftSigX - (doc.getTextWidth('Pembeli') / 2), lineY + 10);
      
      doc.text('(.....................)', rightSigX - (doc.getTextWidth('(.....................)') / 2), lineY + 5);
      doc.text('Owner', rightSigX - (doc.getTextWidth('Owner') / 2), lineY + 10);
    }
    
    // ✅ FOOTER - ALWAYS AT BOTTOM
    const footerY = pageHeight - 20;
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Terima kasih atas kepercayaan Anda', margin, footerY);
    doc.text(`Dicetak pada: ${currentDate.toLocaleString('id-ID')}`, margin, footerY + 4);
    
    // ✅ STATUS - RIGHT ALIGNED AT BOTTOM
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const statusText = payment.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS';
    const statusColor = payment.status === 'PAID' ? [0, 150, 0] : [200, 0, 0];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    const statusWidth = doc.getTextWidth(`Status: ${statusText}`);
    doc.text(`Status: ${statusText}`, pageWidth - margin - statusWidth, footerY);

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Faktur-${payment.order.orderNumber}.pdf"`
      }
    });

  } catch (error) {
    console.error("Download invoice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}