// src/app/api/customer/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Parallel queries untuk performa yang lebih baik
    const [
      totalOrders,
      pendingOrders, 
      completedOrders,
      totalSpentResult,
      recentOrders
    ] = await Promise.all([
      // Total pesanan
      prisma.order.count({
        where: { userId }
      }),
      
      // Pesanan pending
      prisma.order.count({
        where: { 
          userId,
          status: "PENDING"
        }
      }),
      
      // Pesanan selesai
      prisma.order.count({
        where: { 
          userId,
          status: "DELIVERED"
        }
      }),
      
      // Total pengeluaran
      prisma.order.aggregate({
        where: { 
          userId,
          status: {
            in: ["DELIVERED", "SHIPPED", "PROCESSING"]
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      
      // 5 pesanan terbaru
      prisma.order.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  images: {
                    take: 1,
                    select: { url: true }
                  }
                }
              },
              service: {
                select: {
                  name: true,
                  images: {
                    take: 1,
                    select: { url: true }
                  }
                }
              }
            }
          }
        }
      })
    ]);

    const dashboardData = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalSpent: totalSpentResult._sum.totalAmount || 0,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.orderItems.length,
        items: order.orderItems.map(item => ({
          name: item.product?.name || item.service?.name,
          image: item.product?.images[0]?.url || item.service?.images[0]?.url,
          quantity: item.quantity
        }))
      }))
    };

    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}