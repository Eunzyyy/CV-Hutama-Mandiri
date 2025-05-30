// src/app/api/customer/services/categories/route.ts - FIXED
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

    // ✅ Use Category model with SERVICE type filter
    const categories = await prisma.category.findMany({
      where: {
        type: "SERVICE" // ✅ Filter by CategoryType.SERVICE
      },
      select: {
        id: true,
        publicId: true,
        name: true,
        description: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json({
      categories
    });

  } catch (error) {
    console.error("Get service categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}