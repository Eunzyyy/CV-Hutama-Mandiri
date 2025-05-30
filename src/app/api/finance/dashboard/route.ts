//src/app/api/finance/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["FINANCE", "OWNER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    console.log("=== FINANCE DASHBOARD - REAL DATA ONLY ===");

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 🔥 FIX: Check payment status enum values first
    const availablePaymentStatuses = await prisma.payment.findMany({
      select: { status: true },
      distinct: ['status'],
      take: 10
    });

    console.log("Available payment statuses:", availablePaymentStatuses);

    // 🔥 FIX: Use actual status values from database
    const paidStatuses = ['PAID', 'COMPLETED', 'SUCCESS'];
    const pendingStatuses = ['PENDING', 'PENDING_VERIFICATION', 'WAITING'];
    const failedStatuses = ['FAILED', 'CANCELLED', 'REJECTED'];

    // Find which statuses actually exist
    const existingStatuses = availablePaymentStatuses.map(p => p.status);
    const actualPaidStatuses = paidStatuses.filter(status => existingStatuses.includes(status));
    const actualPendingStatuses = pendingStatuses.filter(status => existingStatuses.includes(status));
    const actualFailedStatuses = failedStatuses.filter(status => existingStatuses.includes(status));

    console.log("Actual paid statuses:", actualPaidStatuses);
    console.log("Actual pending statuses:", actualPendingStatuses);

    // Fetch real data from database
    const [
      totalRevenue,
      periodRevenue,
      dailyRevenue,
      weeklyRevenue,
      totalOrders,
      paidPayments,
      pendingPayments,
      failedPayments,
      recentPayments
    ] = await Promise.all([
      // Total Revenue (all time) - use flexible status check
      actualPaidStatuses.length > 0 
        ? prisma.payment.aggregate({
            where: { status: { in: actualPaidStatuses } },
            _sum: { amount: true },
            _avg: { amount: true },
            _count: true
          })
        : Promise.resolve({ _sum: { amount: 0 }, _avg: { amount: 0 }, _count: 0 }),
      
      // Period Revenue
      actualPaidStatuses.length > 0 
        ? prisma.payment.aggregate({
            where: { 
              status: { in: actualPaidStatuses },
              paidAt: { gte: startDate }
            },
            _sum: { amount: true }
          })
        : Promise.resolve({ _sum: { amount: 0 } }),

      // Daily Revenue
      actualPaidStatuses.length > 0 
        ? prisma.payment.aggregate({
            where: { 
              status: { in: actualPaidStatuses },
              paidAt: { 
                gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
              }
            },
            _sum: { amount: true }
          })
        : Promise.resolve({ _sum: { amount: 0 } }),

      // Weekly Revenue
      actualPaidStatuses.length > 0 
        ? prisma.payment.aggregate({
            where: { 
              status: { in: actualPaidStatuses },
              paidAt: { 
                gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              }
            },
            _sum: { amount: true }
          })
        : Promise.resolve({ _sum: { amount: 0 } }),
      
      // Total Orders
      prisma.order.count(),
      
      // Paid Payments
      actualPaidStatuses.length > 0 
        ? prisma.payment.count({ where: { status: { in: actualPaidStatuses } } })
        : Promise.resolve(0),
      
      // Pending Payments
      actualPendingStatuses.length > 0 
        ? prisma.payment.count({ where: { status: { in: actualPendingStatuses } } })
        : Promise.resolve(0),
      
      // Failed Payments
      actualFailedStatuses.length > 0 
        ? prisma.payment.count({ where: { status: { in: actualFailedStatuses } } })
        : Promise.resolve(0),
      
      // Recent Payments
      actualPaidStatuses.length > 0 
        ? prisma.payment.findMany({
            take: 10,
            where: { status: { in: actualPaidStatuses } },
            orderBy: { paidAt: 'desc' },
            include: {
              order: {
                include: {
                  user: {
                    select: { name: true }
                  }
                }
              }
            }
          })
        : Promise.resolve([])
    ]);

    // Payment Methods (group by method) - if payments exist
    const paymentMethods = actualPaidStatuses.length > 0 
      ? await prisma.payment.groupBy({
          by: ['method'],
          where: { status: { in: actualPaidStatuses } },
          _sum: { amount: true },
          _count: true
        }).catch(() => [])
      : [];

    // Calculate metrics
    const totalPaidAmount = totalRevenue._sum.amount || 0;
    const periodAmount = periodRevenue._sum.amount || 0;
    const dailyAmount = dailyRevenue._sum.amount || 0;
    const weeklyAmount = weeklyRevenue._sum.amount || 0;
    const averageOrderValue = totalRevenue._avg.amount || 0;
    const paymentRate = totalOrders > 0 ? (paidPayments / totalOrders * 100) : 0;
    const collectionRate = (paidPayments + pendingPayments) > 0 ? (paidPayments / (paidPayments + pendingPayments) * 100) : 0;

    // Format recent activity
    const formattedActivity = recentPayments.map(payment => ({
      title: `Payment received from ${payment.order?.user?.name || 'Customer'} - Order #${payment.order?.orderNumber || 'N/A'}`,
      time: formatTimeAgo(payment.paidAt || payment.createdAt),
      amount: payment.amount,
      type: 'income' as const,
      status: 'completed' as const
    }));

    // Format payment methods
    const formattedPaymentMethods = paymentMethods.map(method => {
      const percentage = totalPaidAmount > 0 ? ((method._sum.amount || 0) / totalPaidAmount * 100) : 0;
      return {
        method: method.method || 'Unknown',
        count: method._count,
        amount: method._sum.amount || 0,
        percentage: Number(percentage.toFixed(1))
      };
    });

    // Generate alerts based on real data
    const alerts = [];
    if (pendingPayments > 0) {
      alerts.push({
        type: 'warning' as const,
        title: 'Pending Payments',
        message: `${pendingPayments} payments awaiting verification`,
        priority: 'high' as const
      });
    }
    if (paymentRate < 80 && totalOrders > 0) {
      alerts.push({
        type: 'error' as const,
        title: 'Low Payment Rate',
        message: `Payment rate is only ${paymentRate.toFixed(1)}%`,
        priority: 'high' as const
      });
    }
    if (totalPaidAmount === 0) {
      alerts.push({
        type: 'info' as const,
        title: 'No Revenue Data',
        message: `No payments found with status: ${actualPaidStatuses.join(', ') || 'None'}`,
        priority: 'medium' as const
      });
    }

    const dashboardStats = {
      totalRevenue: totalPaidAmount,
      monthlyRevenue: periodAmount,
      weeklyRevenue: weeklyAmount,
      dailyRevenue: dailyAmount,
      totalPendingPayments: pendingPayments,
      totalPaidOrders: paidPayments,
      totalUnpaidOrders: totalOrders - paidPayments,
      paymentRate: Number(paymentRate.toFixed(1)),
      averageOrderValue: Number(averageOrderValue),
      totalTransactions: totalOrders,
      pendingAmount: pendingPayments * averageOrderValue,
      collectionRate: Number(collectionRate.toFixed(1)),
      revenueGrowth: 0,
      monthlyGrowth: 0,
      weeklyGrowth: 0,
      topPaymentMethod: formattedPaymentMethods[0]?.method || 'None',
      cashflowTrend: [],
      recentActivity: formattedActivity,
      paymentMethods: formattedPaymentMethods,
      topCustomers: [],
      alerts: alerts,
      lastUpdated: new Date().toISOString()
    };

    console.log("=== FINANCE DASHBOARD REAL DATA ===");
    console.log("Total Revenue:", totalPaidAmount);
    console.log("Paid Payments:", paidPayments);
    console.log("Pending Payments:", pendingPayments);
    console.log("Total Orders:", totalOrders);
    console.log("Available statuses:", existingStatuses);

    return NextResponse.json(dashboardStats);
    
  } catch (error) {
    console.error("Finance dashboard error:", error);
    
    return NextResponse.json({
      error: "Failed to fetch dashboard data",
      details: error.message
    }, { status: 500 });
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
}