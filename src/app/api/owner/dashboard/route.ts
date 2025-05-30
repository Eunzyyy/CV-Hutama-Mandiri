//src/app/api/owner/dashboard/route.ts
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

    if (session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("=== OWNER DASHBOARD - REAL DATA ONLY ===");

    // Fetch real data from database
    const [
      totalRevenue,
      totalUsers,
      totalOrders,
      totalProducts,
      totalServices,
      pendingOrders,
      pendingPayments,
      recentActivity
    ] = await Promise.all([
      // Total Revenue from PAID payments
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true }
      }),
      
      // Total Users (exclude OWNER)
      prisma.user.count({
        where: { role: { not: "OWNER" } }
      }),
      
      // Total Orders
      prisma.order.count(),
      
      // Total Products
      prisma.product.count(),
      
      // Total Services
      prisma.service.count(),
      
      // Pending Orders
      prisma.order.count({
        where: { status: "PENDING" }
      }),
      
      // Pending Payments
      prisma.payment.count({
        where: { status: { in: ["PENDING", "PENDING_VERIFICATION"] } }
      }),
      
      // Recent Activity - real orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true }
          }
        }
      })
    ]);

    // Calculate monthly growth (current vs previous month)
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    const [currentMonthOrders, lastMonthOrders] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: currentMonthStart } }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lt: currentMonthStart
          }
        }
      })
    ]);

    const monthlyGrowth = lastMonthOrders > 0 
      ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100)
      : 0;

    // Format recent activity
    const formattedActivity = recentActivity.map(order => ({
      title: `Order #${order.orderNumber} from ${order.user?.name || 'Customer'} - ${order.status} - ${order.totalAmount ? `Rp ${order.totalAmount.toLocaleString('id-ID')}` : 'No amount'}`,
      time: formatTimeAgo(order.createdAt)
    }));

    const dashboardStats = {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalUsers: totalUsers,
      totalOrders: totalOrders,
      totalProducts: totalProducts,
      totalServices: totalServices,
      pendingOrders: pendingOrders,
      pendingPayments: pendingPayments,
      averageRating: 0, // Calculate from real reviews if available
      monthlyGrowth: Number(monthlyGrowth.toFixed(1)),
      recentActivity: formattedActivity
    };

    console.log("=== OWNER DASHBOARD REAL DATA ===");
    console.log("Revenue:", dashboardStats.totalRevenue);
    console.log("Orders:", dashboardStats.totalOrders);
    console.log("Users:", dashboardStats.totalUsers);

    return NextResponse.json(dashboardStats);
    
  } catch (error) {
    console.error("Error fetching owner dashboard:", error);
    return NextResponse.json({ 
      error: "Internal server error",
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