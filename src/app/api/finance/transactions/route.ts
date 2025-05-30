// src/app/api/finance/transactions/route.ts - UPDATED
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    
    // Filter by status
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    // Search by order number or customer name
    if (search) {
      whereClause.OR = [
        {
          orderNumber: {
            contains: search
          }
        },
        {
          user: {
            name: {
              contains: search
            }
          }
        },
        {
          user: {
            email: {
              contains: search
            }
          }
        }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate + "T23:59:59.999Z");
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          orderItems: {
            select: {
              quantity: true,
              price: true,
              product: {
                select: { name: true }
              },
              service: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ]);

    // Format transactions
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      orderNumber: transaction.orderNumber,
      customerName: transaction.user.name,
      customerEmail: transaction.user.email,
      amount: transaction.totalAmount,
      status: transaction.status,
      paymentStatus: transaction.payments[0]?.status || "PENDING",
      paymentMethod: transaction.payments[0]?.method || transaction.paymentMethod,
      itemCount: transaction.orderItems.length,
      type: "ORDER",
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      description: transaction.orderItems.map(item => 
        item.product?.name || item.service?.name
      ).slice(0, 2).join(", ") + (transaction.orderItems.length > 2 ? "..." : "")
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}