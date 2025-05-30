// src/app/api/finance/transactions/stats/route.ts
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

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        prevStartDate = new Date(now.getFullYear(), quarterStart - 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    const [
      totalTransactions,
      currentPeriodStats,
      previousPeriodStats,
      statusBreakdown
    ] = await Promise.all([
      // Total transactions count
      prisma.order.count(),
      
      // Current period stats
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: true,
        _sum: {
          totalAmount: true
        }
      }),
      
      // Previous period stats for comparison
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: prevStartDate,
            lt: startDate
          }
        },
        _count: true,
        _sum: {
          totalAmount: true
        }
      }),
      
      // Status breakdown
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
          totalAmount: true
        },
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
    ]);

    // Calculate growth rates
    const currentRevenue = currentPeriodStats._sum.totalAmount || 0;
    const previousRevenue = previousPeriodStats._sum.totalAmount || 0;
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const currentCount = currentPeriodStats._count || 0;
    const previousCount = previousPeriodStats._count || 0;
    const countGrowth = previousCount > 0 
      ? ((currentCount - previousCount) / previousCount) * 100 
      : 0;

    const stats = {
      totalTransactions,
      currentPeriod: {
        transactions: currentCount,
        revenue: currentRevenue,
        averageValue: currentCount > 0 ? currentRevenue / currentCount : 0
      },
      growth: {
        revenue: revenueGrowth,
        transactions: countGrowth
      },
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item.status] = {
          count: item._count,
          amount: item._sum.totalAmount || 0
        };
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Get transaction stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}