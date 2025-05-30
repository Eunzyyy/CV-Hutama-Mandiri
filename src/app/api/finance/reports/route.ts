// src/app/api/finance/reports/route.ts
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("type") || "revenue";

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date

    // Get orders within date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "DELIVERED" // Only completed orders
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
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
        },
        payments: {
          where: {
            status: "PAID"
          }
        }
      }
    });

    // Calculate summary statistics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top products
    const productStats = new Map();
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const itemName = item.product?.name || item.service?.name || 'Unknown Item';
        const revenue = item.quantity * item.price;
        
        if (productStats.has(itemName)) {
          const existing = productStats.get(itemName);
          productStats.set(itemName, {
            name: itemName,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + revenue
          });
        } else {
          productStats.set(itemName, {
            name: itemName,
            quantity: item.quantity,
            revenue: revenue
          });
        }
      });
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Get daily revenue
    const dailyRevenue = new Map();
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (dailyRevenue.has(dateKey)) {
        const existing = dailyRevenue.get(dateKey);
        dailyRevenue.set(dateKey, {
          date: dateKey,
          revenue: existing.revenue + order.totalAmount,
          orders: existing.orders + 1
        });
      } else {
        dailyRevenue.set(dateKey, {
          date: dateKey,
          revenue: order.totalAmount,
          orders: 1
        });
      }
    });

    const reportData = {
      period: `${startDate} - ${endDate}`,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      dailyRevenue: Array.from(dailyRevenue.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      orders: orders.map(order => ({
        orderNumber: order.orderNumber,
        customerName: order.user.name,
        customerEmail: order.user.email,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.orderItems.map(item => ({
          name: item.product?.name || item.service?.name || 'Unknown',
          sku: item.product?.sku || '',
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        }))
      }))
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