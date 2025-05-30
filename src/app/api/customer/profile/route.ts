// src/app/api/profile/route.ts - PROFILE API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Normalize phone field
    const profile = {
      ...user,
      phone: user.phone || user.phoneNumber || null
    };

    return NextResponse.json(profile);

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await req.json();
    const { name, phone, address } = body;

    // Validate input
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama harus minimal 2 karakter" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
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
        createdAt: true
      }
    });

    // Normalize response
    const profile = {
      ...updatedUser,
      phone: updatedUser.phone || updatedUser.phoneNumber || null
    };

    return NextResponse.json(profile);

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}