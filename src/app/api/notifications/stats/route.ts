// src/app/api/notifications/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "OWNER", "FINANCE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get unread notifications count by type
    const [orderNotifications, messageNotifications, productNotifications, totalUnread] = await Promise.all([
      prisma.notification.count({
        where: {
          isRead: false,
          type: {
            in: ["ORDER_CREATED", "ORDER_UPDATED", "ORDER_CANCELLED"]
          }
        }
      }),
      prisma.notification.count({
        where: {
          isRead: false,
          type: {
            in: ["REVIEW_ADDED", "USER_REGISTERED"]
          }
        }
      }),
      prisma.notification.count({
        where: {
          isRead: false,
          type: "SYSTEM_ALERT"
        }
      }),
      prisma.notification.count({
        where: {
          isRead: false
        }
      })
    ]);

    return NextResponse.json({
      total: totalUnread,
      orders: orderNotifications,
      messages: messageNotifications,
      products: productNotifications
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}