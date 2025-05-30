//src/app/api/customer/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    console.log("=== CUSTOMER ORDERS API ===");
    console.log("User ID:", userId);
    console.log("Search:", search);
    console.log("Status:", status);

    // Build where clause - SIMPLIFIED WITHOUT MODE
    let where: any = {
      userId: userId
    };

    // Status filter
    if (status && status !== "ALL" && status !== "") {
      where.status = status;
    }

    // Search filter - SIMPLE CONTAINS WITHOUT MODE
    if (search && search.trim()) {
      where.OR = [
        { orderNumber: { contains: search.trim() } },
        { notes: { contains: search.trim() } }
      ];
    }

    console.log("Where clause:", JSON.stringify(where, null, 2));

    try {
      // Execute queries with better error handling
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: {
                      take: 1,
                      select: { url: true },
                    },
                  },
                },
                service: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            payments: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                status: true,
                method: true,
                amount: true,
                createdAt: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      console.log("✅ Found orders:", orders.length);
      console.log("✅ Total orders:", total);

      return NextResponse.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        }
      });
      
    } catch (queryError) {
      console.error("❌ Database query error:", queryError);
      return NextResponse.json({ 
        error: "Database query failed",
        details: queryError.message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("❌ Customer orders API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message
    }, { status: 500 });
  }
}