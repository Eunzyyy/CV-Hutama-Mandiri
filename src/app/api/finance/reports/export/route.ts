// src/app/api/finance/reports/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "FINANCE", "OWNER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const format = searchParams.get("format") || "pdf";
    const reportType = searchParams.get("type") || "revenue";

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Get data (reuse logic from main reports API)
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: "DELIVERED"
      },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          include: {
            product: { select: { name: true, sku: true } },
            service: { select: { name: true } }
          }
        },
        payments: { where: { status: "PAID" } }
      }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Generate based on format
    switch (format.toLowerCase()) {
      case 'pdf':
        return generatePDFReport(orders, startDate, endDate, totalRevenue, totalOrders);
      case 'xlsx':
      case 'excel':
        return generateExcelReport(orders, startDate, endDate, totalRevenue, totalOrders);
      case 'csv':
        return generateCSVReport(orders, startDate, endDate, totalRevenue, totalOrders);
      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }

  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PDF Generation
function generatePDFReport(orders: any[], startDate: string, endDate: string, totalRevenue: number, totalOrders: number) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text('LAPORAN KEUANGAN', 20, 25);
  doc.text('CV HUTAMA MANDIRI INDOTECH', 20, 35);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Periode: ${startDate} s/d ${endDate}`, 20, 50);
  doc.text(`Digenerate pada: ${new Date().toLocaleString('id-ID')}`, 20, 58);
  
  // Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text('RINGKASAN', 20, 75);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}`, 20, 85);
  doc.text(`Total Pesanan: ${totalOrders}`, 20, 92);
  doc.text(`Rata-rata Nilai Pesanan: Rp ${(totalRevenue / totalOrders || 0).toLocaleString('id-ID')}`, 20, 99);
  
  // Orders Table
  const tableData = orders.map(order => [
    order.orderNumber,
    order.user.name,
    order.createdAt.toLocaleDateString('id-ID'),
    `Rp ${order.totalAmount.toLocaleString('id-ID')}`,
    order.status
  ]);
  
  autoTable(doc, {
    head: [['Order Number', 'Customer', 'Tanggal', 'Total', 'Status']],
    body: tableData,
    startY: 110,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="laporan-keuangan-${startDate}-${endDate}.pdf"`
    }
  });
}

// Excel Generation
function generateExcelReport(orders: any[], startDate: string, endDate: string, totalRevenue: number, totalOrders: number) {
  const workbook = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['LAPORAN KEUANGAN - CV HUTAMA MANDIRI INDOTECH'],
    [`Periode: ${startDate} s/d ${endDate}`],
    [`Digenerate: ${new Date().toLocaleString('id-ID')}`],
    [''],
    ['RINGKASAN'],
    ['Total Revenue', `Rp ${totalRevenue.toLocaleString('id-ID')}`],
    ['Total Pesanan', totalOrders],
    ['Rata-rata Nilai Pesanan', `Rp ${(totalRevenue / totalOrders || 0).toLocaleString('id-ID')}`]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Orders Sheet
  const ordersData = [
    ['Order Number', 'Customer', 'Email', 'Tanggal', 'Total Amount', 'Status']
  ];
  
  orders.forEach(order => {
    ordersData.push([
      order.orderNumber,
      order.user.name,
      order.user.email,
      order.createdAt.toLocaleDateString('id-ID'),
      order.totalAmount,
      order.status
    ]);
  });
  
  const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
  XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders');
  
  // Order Items Sheet
  const itemsData = [
    ['Order Number', 'Customer', 'Item Name', 'SKU', 'Quantity', 'Price', 'Total']
  ];
  
  orders.forEach(order => {
    order.orderItems.forEach((item: any) => {
      itemsData.push([
        order.orderNumber,
        order.user.name,
        item.product?.name || item.service?.name || 'Unknown',
        item.product?.sku || '',
        item.quantity,
        item.price,
        item.quantity * item.price
      ]);
    });
  });
  
  const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
  XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Order Items');
  
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="laporan-keuangan-${startDate}-${endDate}.xlsx"`
    }
  });
}

// CSV Generation
function generateCSVReport(orders: any[], startDate: string, endDate: string, totalRevenue: number, totalOrders: number) {
  let csvContent = '';
  
  // Header
  csvContent += `"LAPORAN KEUANGAN - CV HUTAMA MANDIRI INDOTECH"\n`;
  csvContent += `"Periode: ${startDate} s/d ${endDate}"\n`;
  csvContent += `"Digenerate: ${new Date().toLocaleString('id-ID')}"\n`;
  csvContent += '\n';
  
  // Summary
  csvContent += '"RINGKASAN"\n';
  csvContent += `"Total Revenue","Rp ${totalRevenue.toLocaleString('id-ID')}"\n`;
  csvContent += `"Total Pesanan","${totalOrders}"\n`;
  csvContent += `"Rata-rata Nilai Pesanan","Rp ${(totalRevenue / totalOrders || 0).toLocaleString('id-ID')}"\n`;
  csvContent += '\n';
  
  // Orders
  csvContent += '"DETAIL PESANAN"\n';
  csvContent += '"Order Number","Customer","Email","Tanggal","Total Amount","Status"\n';
  
  orders.forEach(order => {
    csvContent += `"${order.orderNumber}","${order.user.name}","${order.user.email}","${order.createdAt.toLocaleDateString('id-ID')}","${order.totalAmount}","${order.status}"\n`;
  });
  
  const csvBuffer = Buffer.from(csvContent, 'utf8');
  
  return new NextResponse(csvBuffer, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="laporan-keuangan-${startDate}-${endDate}.csv"`
    }
  });
}