// src/app/api/finance/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const period = searchParams.get("period") || "month";

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        prevEndDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        prevStartDate = new Date(now.getFullYear(), quarterStart - 3, 1);
        prevEndDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        prevEndDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get all-time stats
    const [totalOrdersCount, totalRevenue] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      })
    ]);

    // Get current period stats
    const currentPeriodStats = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: true,
      _sum: {
        totalAmount: true
      }
    });

    // Get previous period stats for comparison
    const previousPeriodStats = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: prevStartDate,
          lt: prevEndDate
        }
      },
      _count: true,
      _sum: {
        totalAmount: true
      }
    });

    // Get order status breakdown for current period
    const [pendingOrders, completedOrders, cancelledOrders] = await Promise.all([
      prisma.order.count({
        where: {
          status: "PENDING",
          createdAt: { gte: startDate }
        }
      }),
      prisma.order.count({
        where: {
          status: "DELIVERED",
          createdAt: { gte: startDate }
        }
      }),
      prisma.order.count({
        where: {
          status: "CANCELLED",
          createdAt: { gte: startDate }
        }
      })
    ]);

    // Calculate growth rates
    const currentRevenue = currentPeriodStats._sum.totalAmount || 0;
    const previousRevenue = previousPeriodStats._sum.totalAmount || 0;
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const currentOrders = currentPeriodStats._count || 0;
    const previousOrders = previousPeriodStats._count || 0;
    const orderGrowth = previousOrders > 0 
      ? ((currentOrders - previousOrders) / previousOrders) * 100 
      : 0;

    const averageOrderValue = currentOrders > 0 ? currentRevenue / currentOrders : 0;

    const stats = {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      monthlyRevenue: currentRevenue,
      totalOrders: totalOrdersCount,
      monthlyOrders: currentOrders,
      averageOrderValue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      revenueGrowth,
      orderGrowth
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Get finance stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}