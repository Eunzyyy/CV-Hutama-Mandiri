// src/app/api/owner/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Financial Summary
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

    const averageOrderValue = totalOrders > 0 
      ? (totalRevenue._sum.amount || 0) / totalOrders 
      : 0;

    // Growth calculation (compare with previous period)
    const periodLength = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodLength);
    const prevEnd = new Date(start.getTime() - 1);

    const prevRevenue = await prisma.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: prevStart, lte: prevEnd }
      },
      _sum: { amount: true }
    });

    const growthRate = (prevRevenue._sum.amount || 0) > 0
      ? (((totalRevenue._sum.amount || 0) - (prevRevenue._sum.amount || 0)) / (prevRevenue._sum.amount || 0)) * 100
      : 0;

    // User Metrics
    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: start, lte: end }
      }
    });

    const activeUsers = await prisma.user.count({
      where: {
        orders: {
          some: {
            createdAt: { gte: start, lte: end }
          }
        }
      }
    });

    // Top Products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { not: null },
        order: {
          status: "DELIVERED",
          createdAt: { gte: start, lte: end }
        }
      },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 10
    });

    const productPerformance = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId! },
          select: { name: true }
        });
        return {
          name: product?.name || 'Unknown Product',
          sales: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * (item._sum.price || 0)
        };
      })
    );

    // Top Services
    const topServices = await prisma.orderItem.groupBy({
      by: ['serviceId'],
      where: {
        serviceId: { not: null },
        order: {
          status: "DELIVERED",
          createdAt: { gte: start, lte: end }
        }
      },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 10
    });

    const servicePerformance = await Promise.all(
      topServices.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId! },
          select: { name: true }
        });
        return {
          name: service?.name || 'Unknown Service',
          orders: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * (item._sum.price || 0)
        };
      })
    );

    // Monthly Trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthRevenue = await prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      });

      const monthOrders = await prisma.order.count({
        where: {
          status: "DELIVERED",
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      });

      const monthUsers = await prisma.user.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      });

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        revenue: monthRevenue._sum.amount || 0,
        orders: monthOrders,
        users: monthUsers
      });
    }

    const reportData = {
      financialSummary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalOrders,
        averageOrderValue,
        growthRate: Number(growthRate.toFixed(1))
      },
      userMetrics: {
        totalUsers,
        newUsers,
        activeUsers,
        retentionRate: totalUsers > 0 ? (activeUsers / totalUsers * 100) : 0
      },
      productPerformance,
      servicePerformance,
      monthlyTrends
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}