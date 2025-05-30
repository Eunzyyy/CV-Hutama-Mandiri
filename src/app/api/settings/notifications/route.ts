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

    // Try to get existing notification settings
    let notificationSettings = await prisma.userNotificationSettings.findUnique({
      where: { userId }
    });

    // If no settings exist, create default settings
    if (!notificationSettings) {
      notificationSettings = await prisma.userNotificationSettings.create({
        data: {
          userId,
          emailNotifications: true,
          orderUpdates: true,
          promotionalEmails: false,
          smsNotifications: false
        }
      });
    }

    return NextResponse.json({
      settings: {
        emailNotifications: notificationSettings.emailNotifications,
        orderUpdates: notificationSettings.orderUpdates,
        promotionalEmails: notificationSettings.promotionalEmails,
        smsNotifications: notificationSettings.smsNotifications
      }
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

    const userId = parseInt(session.user.id);
    const body = await req.json();
    
    const { emailNotifications, orderUpdates, promotionalEmails, smsNotifications } = body;

    // Update or create notification settings
    const updatedSettings = await prisma.userNotificationSettings.upsert({
      where: { userId },
      update: {
        emailNotifications: Boolean(emailNotifications),
        orderUpdates: Boolean(orderUpdates),
        promotionalEmails: Boolean(promotionalEmails),
        smsNotifications: Boolean(smsNotifications),
        updatedAt: new Date()
      },
      create: {
        userId,
        emailNotifications: Boolean(emailNotifications),
        orderUpdates: Boolean(orderUpdates),
        promotionalEmails: Boolean(promotionalEmails),
        smsNotifications: Boolean(smsNotifications)
      }
    });

    return NextResponse.json({
      message: "Pengaturan notifikasi berhasil diperbarui",
      settings: {
        emailNotifications: updatedSettings.emailNotifications,
        orderUpdates: updatedSettings.orderUpdates,
        promotionalEmails: updatedSettings.promotionalEmails,
        smsNotifications: updatedSettings.smsNotifications
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