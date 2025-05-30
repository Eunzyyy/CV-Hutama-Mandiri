// src/app/api/chat/conversations/route.ts - UPDATE DENGAN SEARCH & PREVENT DUPLICATE
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        conversations: []
      }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;
    
    // ✅ GET SEARCH PARAMETER
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let conversations = [];

    const baseWhere = {
      isDeleted: false, // ✅ EXCLUDE DELETED CONVERSATIONS
      // ✅ SEARCH FUNCTIONALITY
      ...(search && {
        OR: [
          { subject: { contains: search, mode: 'insensitive' as any } },
          { customer: { name: { contains: search, mode: 'insensitive' as any } } },
          { admin: { name: { contains: search, mode: 'insensitive' as any } } },
          { finance: { name: { contains: search, mode: 'insensitive' as any } } }
        ]
      })
    };

    if (userRole === "CUSTOMER") {
      conversations = await prisma.conversation.findMany({
        where: {
          ...baseWhere,
          customerId: userId
        },
        include: {
          admin: { select: { id: true, name: true, email: true } },
          finance: { select: { id: true, name: true, email: true } },
          customer: { select: { id: true, name: true, email: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: { select: { id: true, name: true, role: true } },
              attachments: {
                select: { fileType: true, originalName: true }
              }
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      });

    } else if (userRole === "ADMIN") {
      conversations = await prisma.conversation.findMany({
        where: {
          ...baseWhere,
          OR: [
            { adminId: userId },
            { adminId: null, financeId: null }
          ]
        },
        include: {
          admin: { select: { id: true, name: true, email: true } },
          finance: { select: { id: true, name: true, email: true } },
          customer: { select: { id: true, name: true, email: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: { select: { id: true, name: true, role: true } },
              attachments: {
                select: { fileType: true, originalName: true }
              }
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      });

    } else if (userRole === "FINANCE") {
      conversations = await prisma.conversation.findMany({
        where: {
          ...baseWhere,
          OR: [
            { financeId: userId },
            { financeId: null, adminId: null }
          ]
        },
        include: {
          admin: { select: { id: true, name: true, email: true } },
          finance: { select: { id: true, name: true, email: true } },
          customer: { select: { id: true, name: true, email: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: { select: { id: true, name: true, role: true } },
              attachments: {
                select: { fileType: true, originalName: true }
              }
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      });
    }

    // Hitung unread messages
    for (let conv of conversations) {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          isRead: false,
          senderId: { not: userId }
        }
      });
      (conv as any)._count = { messages: unreadCount };
    }

    return NextResponse.json({
      success: true,
      conversations: conversations || []
    });

  } catch (error: any) {
    console.error("❌ Error fetching conversations:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      conversations: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientType, subject, message } = body;
    const customerId = parseInt(session.user.id);

    if (!recipientType || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["ADMIN", "FINANCE"].includes(recipientType)) {
      return NextResponse.json({ error: "Invalid recipient type" }, { status: 400 });
    }

    // ✅ CEK APAKAH SUDAH ADA CONVERSATION ANTARA CUSTOMER DAN RECIPIENT TYPE
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        customerId,
        isDeleted: false,
        OR: [
          { adminId: { not: null }, AND: recipientType === "ADMIN" ? {} : { id: -1 } },
          { financeId: { not: null }, AND: recipientType === "FINANCE" ? {} : { id: -1 } }
        ]
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        finance: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, name: true, email: true } }
      }
    });

    // ✅ JIKA SUDAH ADA, KIRIM MESSAGE KE CONVERSATION YANG ADA
    if (existingConversation) {
      await prisma.message.create({
        data: {
          conversationId: existingConversation.id,
          senderId: customerId,
          senderType: "CUSTOMER",
          message: message.trim()
        }
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: existingConversation.id },
        data: { updatedAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        conversation: existingConversation,
        isExisting: true,
        message: "Message sent to existing conversation"
      });
    }

    // ✅ JIKA BELUM ADA, BUAT CONVERSATION BARU
    const recipient = await prisma.user.findFirst({
      where: { role: recipientType },
      select: { id: true, name: true }
    });

    if (!recipient) {
      return NextResponse.json({ error: `No ${recipientType.toLowerCase()} available` }, { status: 400 });
    }

    const conversation = await prisma.conversation.create({
      data: {
        customerId,
        adminId: recipientType === "ADMIN" ? recipient.id : null,
        financeId: recipientType === "FINANCE" ? recipient.id : null,
        subject: subject || `Chat with ${recipientType.toLowerCase()}`,
        status: "ACTIVE"
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        finance: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, name: true, email: true } }
      }
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: customerId,
        senderType: "CUSTOMER",
        message: message.trim()
      }
    });

    return NextResponse.json({
      success: true,
      conversation,
      isExisting: false,
      message: "New conversation created"
    });

  } catch (error: any) {
    console.error("❌ Error creating conversation:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}