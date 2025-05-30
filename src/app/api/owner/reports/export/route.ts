// src/app/api/owner/reports/export/route.ts
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
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("type") || "comprehensive";
    const format = searchParams.get("format") || "pdf";

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get report data (reuse logic from reports API)
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: start, lte: end }
      },
      _sum: { amount: true }
    });

    const totalOrders = await prisma.order.count({
      where: {
        createdAt: { gte: start, lte: end },
        status: "DELIVERED"
      }
    });

    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: start, lte: end }
      }
    });

    // Get detailed orders for export
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      include: {
        user: { select: { name: true, email: true } },
        payments: { select: { status: true, method: true, amount: true } }
      },
      take: 100 // Limit for performance
    });

    const reportData = {
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalOrders,
        totalUsers,
        newUsers,
        averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.amount || 0) / totalOrders : 0
      },
      orders
    };

    // Generate based on format
    switch (format.toLowerCase()) {
      case 'pdf':
        return generatePDFReport(reportData, startDate, endDate, reportType);
      case 'xlsx':
      case 'excel':
        return generateExcelReport(reportData, startDate, endDate, reportType);
      case 'csv':
        return generateCSVReport(reportData, startDate, endDate, reportType);
      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }

  } catch (error) {
    console.error("Reports export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generatePDFReport(data: any, startDate: string, endDate: string, reportType: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text('BUSINESS REPORT', 20, 25);
  doc.text('CV HUTAMA MANDIRI INDOTECH', 20, 35);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Report Type: ${reportType.toUpperCase()}`, 20, 50);
  doc.text(`Period: ${startDate} - ${endDate}`, 20, 58);
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 20, 66);
  
  // Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text('EXECUTIVE SUMMARY', 20, 85);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Revenue: Rp ${data.summary.totalRevenue.toLocaleString('id-ID')}`, 20, 95);
  doc.text(`Total Orders: ${data.summary.totalOrders}`, 20, 102);
  doc.text(`Total Users: ${data.summary.totalUsers}`, 20, 109);
  doc.text(`New Users: ${data.summary.newUsers}`, 20, 116);
  doc.text(`Average Order Value: Rp ${data.summary.averageOrderValue.toLocaleString('id-ID')}`, 20, 123);

  // Orders table
  if (data.orders.length > 0) {
    const tableData = data.orders.slice(0, 20).map((order: any) => [
      order.orderNumber,
      order.user.name,
      order.status,
      `Rp ${order.totalAmount.toLocaleString('id-ID')}`,
      new Date(order.createdAt).toLocaleDateString('id-ID')
    ]);
    
    autoTable(doc, {
      head: [['Order Number', 'Customer', 'Status', 'Amount', 'Date']],
      body: tableData,
      startY: 135,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  }
  
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="business-report-${startDate}-${endDate}.pdf"`
    }
  });
}

function generateExcelReport(data: any, startDate: string, endDate: string, reportType: string) {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['BUSINESS REPORT - CV HUTAMA MANDIRI INDOTECH'],
    [`Report Type: ${reportType.toUpperCase()}`],
    [`Period: ${startDate} - ${endDate}`],
    [`Generated: ${new Date().toLocaleString('id-ID')}`],
    [''],
    ['EXECUTIVE SUMMARY'],
    ['Total Revenue', `Rp ${data.summary.totalRevenue.toLocaleString('id-ID')}`],
    ['Total Orders', data.summary.totalOrders],
    ['Total Users', data.summary.totalUsers],
    ['New Users', data.summary.newUsers],
    ['Average Order Value', `Rp ${data.summary.averageOrderValue.toLocaleString('id-ID')}`]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Orders sheet
  const ordersData = [
    ['Order Number', 'Customer Name', 'Customer Email', 'Status', 'Total Amount', 'Created Date']
  ];
  
  data.orders.forEach((order: any) => {
    ordersData.push([
      order.orderNumber,
      order.user.name,
      order.user.email,
      order.status,
      order.totalAmount,
      new Date(order.createdAt).toLocaleDateString('id-ID')
    ]);
  });
  
  const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
  XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders');
  
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="business-report-${startDate}-${endDate}.xlsx"`
    }
  });
}

function generateCSVReport(data: any, startDate: string, endDate: string, reportType: string) {
  let csvContent = '';
  
  // Header
  csvContent += `"BUSINESS REPORT - CV HUTAMA MANDIRI INDOTECH"\n`;
  csvContent += `"Report Type: ${reportType.toUpperCase()}"\n`;
  csvContent += `"Period: ${startDate} - ${endDate}"\n`;
  csvContent += `"Generated: ${new Date().toLocaleString('id-ID')}"\n`;
  csvContent += '\n';
  
  // Summary
  csvContent += '"EXECUTIVE SUMMARY"\n';
  csvContent += `"Total Revenue","Rp ${data.summary.totalRevenue.toLocaleString('id-ID')}"\n`;
  csvContent += `"Total Orders","${data.summary.totalOrders}"\n`;
  csvContent += `"Total Users","${data.summary.totalUsers}"\n`;
  csvContent += `"New Users","${data.summary.newUsers}"\n`;
  csvContent += `"Average Order Value","Rp ${data.summary.averageOrderValue.toLocaleString('id-ID')}"\n`;
  csvContent += '\n';
  
  // Orders
  csvContent += '"ORDERS DETAIL"\n';
  csvContent += '"Order Number","Customer Name","Customer Email","Status","Total Amount","Created Date"\n';
  
  data.orders.forEach((order: any) => {
    csvContent += `"${order.orderNumber}","${order.user.name}","${order.user.email}","${order.status}","${order.totalAmount}","${new Date(order.createdAt).toLocaleDateString('id-ID')}"\n`;
  });
  
  const csvBuffer = Buffer.from(csvContent, 'utf8');
  
  return new NextResponse(csvBuffer, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="business-report-${startDate}-${endDate}.csv"`
    }
  });
}