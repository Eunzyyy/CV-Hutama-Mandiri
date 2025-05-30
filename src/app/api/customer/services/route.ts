// src/app/api/customer/services/route.ts
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");

    const skip = (page - 1) * limit;
    
    const whereClause: any = {
      isActive: true
    };

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId);
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          images: {
            select: {
              url: true
            },
            take: 3
          }
        },
        orderBy: [
          { createdAt: "desc" }
        ],
        skip,
        take: limit
      }),
      prisma.service.count({ where: whereClause })
    ]);

    return NextResponse.json({
      services: services.map(service => ({
        id: service.id,
        publicId: service.publicId,
        name: service.name,
        description: service.description,
        price: parseFloat(service.price.toString()), // Convert Decimal to number
        category: service.category,
        images: service.images
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get customer services error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}