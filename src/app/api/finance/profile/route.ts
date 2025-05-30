// src/app/api/finance/profile/route.ts - FIXED
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["FINANCE", "ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneNumber: true,
        address: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format response untuk finance profile
    const profileData = {
      ...user,
      department: "Finance", // Static karena role FINANCE
      employeeId: `EMP-${user.id.toString().padStart(4, '0')}`,
      position: user.role === "FINANCE" ? "Finance Manager" : user.role,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["FINANCE", "ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { name, phone, address } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        phoneNumber: phone, // Update both phone fields
        address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneNumber: true,
        address: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        role: true,
      },
    });

    // Format response
    const profileData = {
      ...updatedUser,
      department: "Finance",
      employeeId: `EMP-${updatedUser.id.toString().padStart(4, '0')}`,
      position: updatedUser.role === "FINANCE" ? "Finance Manager" : updatedUser.role,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}