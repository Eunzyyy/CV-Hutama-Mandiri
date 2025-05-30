// src/app/api/finance/payments/route.ts - UPDATED
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
    const method = searchParams.get("method");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    
    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    
    if (method && method !== "ALL") {
      whereClause.method = method;
    }

    if (search) {
      whereClause.OR = [
        {
          order: {
            orderNumber: {
              contains: search
            }
          }
        },
        {
          order: {
            user: {
              name: {
                contains: search
              }
            }
          }
        },
        {
          order: {
            user: {
              email: {
                contains: search
              }
            }
          }
        }
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          order: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.payment.count({ where: whereClause })
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}