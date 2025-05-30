// src/app/api/owner/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type && type !== "ALL") {
      whereClause.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    });

    const notificationsWithUserName = notifications.map(notification => ({
      ...notification,
      userName: notification.user?.name || null
    }));

    return NextResponse.json(notificationsWithUserName);

  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, message, type, targetUsers } = body;

    // Validate input
    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Create notifications based on target users
    if (targetUsers === "ALL") {
      // Create notification for all users (global notification)
      await prisma.notification.create({
        data: {
          type,
          title,
          message,
          userId: null, // null means for all users
        }
      });
    } else {
      // Get users based on role filter
      const users = await prisma.user.findMany({
        where: targetUsers !== "ALL" ? { role: targetUsers } : {},
        select: { id: true }
      });

      // Create notification for each user
      await prisma.notification.createMany({
        data: users.map(user => ({
          type,
          title,
          message,
          userId: user.id
        }))
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Notifications POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}