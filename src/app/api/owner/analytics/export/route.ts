// src/app/api/owner/analytics/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get analytics data
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    });

    const totalOrders = await prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // Generate PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text('ANALYTICS REPORT', 20, 25);
    doc.text('CV HUTAMA MANDIRI INDOTECH', 20, 35);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Period: ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`, 20, 50);
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 20, 58);
    
    // Summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('BUSINESS SUMMARY', 20, 75);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Revenue: Rp ${(totalRevenue._sum.amount || 0).toLocaleString('id-ID')}`, 20, 85);
    doc.text(`Total Orders: ${totalOrders}`, 20, 92);
    doc.text(`New Users: ${newUsers}`, 20, 99);
    doc.text(`Average Order Value: Rp ${((totalRevenue._sum.amount || 0) / totalOrders || 0).toLocaleString('id-ID')}`, 20, 106);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analytics-report-${range}.pdf"`
      }
    });

  } catch (error) {
    console.error("Analytics export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}