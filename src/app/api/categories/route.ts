//src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("=== API Categories GET Called ===");
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    
    console.log("Query params:", { type, search });

    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected for categories");

    const where: any = {};

    // Filter by type (PRODUCT or SERVICE)
    if (type && ["PRODUCT", "SERVICE"].includes(type)) {
      where.type = type;
      console.log(`Filtering by type: ${type}`);
    }

    // Filter by search term
    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
      console.log(`Searching for: ${search}`);
    }

    console.log("Where condition:", JSON.stringify(where, null, 2));

    const categories = await prisma.category.findMany({
      where,
      select: {
        id: true,
        publicId: true,
        name: true,
        description: true,
        type: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            services: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`✅ Found ${categories.length} categories`);
    
    // Log categories for debugging
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.type}) - ID: ${cat.id}, Products: ${cat._count.products}`);
    });

    // ✅ PENTING: Return array langsung sesuai yang diharapkan frontend
    return NextResponse.json(categories);
    
  } catch (error) {
    console.error("=== Categories API Error ===", error);
    
    // Return empty array jika error, sesuai yang diharapkan frontend
    return NextResponse.json([]);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== API Categories POST Called ===");
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, type } = body;

    console.log("Creating category:", { name, description, type });

    if (!name || !type || !["PRODUCT", "SERVICE"].includes(type)) {
      return NextResponse.json({
        error: "Name and valid type (PRODUCT or SERVICE) are required"
      }, { status: 400 });
    }

    await prisma.$connect();
    
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type,
      },
      select: {
        id: true,
        publicId: true,
        name: true,
        description: true,
        type: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            services: true,
          },
        },
      },
    });

    console.log("✅ Category created:", category);

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category created successfully"
    });
    
  } catch (error) {
    console.error("=== Create Category Error ===", error);
    
    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json({
        error: "Category name already exists"
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: "Failed to create category",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}