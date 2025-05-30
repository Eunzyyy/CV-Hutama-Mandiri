// src/app/api/customer/settings/notifications/route.ts
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

    // Default settings if not found
    const defaultSettings = {
      emailNotifications: true,
      orderUpdates: true,
      promotionalEmails: false,
      smsNotifications: false
    };

    return NextResponse.json({
      settings: defaultSettings
    });

  } catch (error) {
    console.error("Get notification settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    const { emailNotifications, orderUpdates, promotionalEmails, smsNotifications } = body;

    return NextResponse.json({
      message: "Pengaturan notifikasi berhasil diperbarui",
      settings: {
        emailNotifications: Boolean(emailNotifications),
        orderUpdates: Boolean(orderUpdates),
        promotionalEmails: Boolean(promotionalEmails),
        smsNotifications: Boolean(smsNotifications)
      }
    });

  } catch (error) {
    console.error("Update notification settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}