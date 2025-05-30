// src/app/api/owner/analytics/route.ts
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
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get revenue chart data
    const payments = await prisma.payment.findMany({
      where: {
        status: "PAID",
        paidAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        order: true
      }
    });

    // Group by date
    const revenueByDate = new Map();
    payments.forEach(payment => {
      if (payment.paidAt) {
        const dateKey = payment.paidAt.toISOString().split('T')[0];
        if (revenueByDate.has(dateKey)) {
          const existing = revenueByDate.get(dateKey);
          revenueByDate.set(dateKey, {
            date: dateKey,
            revenue: existing.revenue + payment.amount,
            orders: existing.orders + 1
          });
        } else {
          revenueByDate.set(dateKey, {
            date: dateKey,
            revenue: payment.amount,
            orders: 1
          });
        }
      }
    });

    const revenueChart = Array.from(revenueByDate.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get user growth
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const usersByDate = new Map();
    let cumulativeUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: startDate
        }
      }
    });

    users.forEach(user => {
      const dateKey = user.createdAt.toISOString().split('T')[0];
      cumulativeUsers++;
      usersByDate.set(dateKey, {
        date: dateKey,
        users: cumulativeUsers
      });
    });

    const userGrowth = Array.from(usersByDate.values());

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: {
          not: null
        },
        order: {
          status: "DELIVERED",
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          price: 'desc'
        }
      },
      take: 10
    });

    const topProductsWithNames = await Promise.all(
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

    // Get top services
    const topServices = await prisma.orderItem.groupBy({
      by: ['serviceId'],
      where: {
        serviceId: {
          not: null
        },
        order: {
          status: "DELIVERED",
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          price: 'desc'
        }
      },
      take: 10
    });

    const topServicesWithNames = await Promise.all(
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

    // Monthly comparison
    const currentMonth = new Date();
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const currentMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: {
          gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
          lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        }
      },
      _sum: {
        amount: true
      }
    });

    const previousMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: {
          gte: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1),
          lt: new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1)
        }
      },
      _sum: {
        amount: true
      }
    });

    const growth = previousMonthRevenue._sum.amount 
      ? ((currentMonthRevenue._sum.amount || 0) - (previousMonthRevenue._sum.amount || 0)) / (previousMonthRevenue._sum.amount || 1) * 100
      : 0;

    const analyticsData = {
      revenueChart,
      userGrowth,
      topProducts: topProductsWithNames,
      topServices: topServicesWithNames,
      monthlyComparison: {
        currentMonth: currentMonthRevenue._sum.amount || 0,
        previousMonth: previousMonthRevenue._sum.amount || 0,
        growth: Number(growth.toFixed(1))
      }
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}