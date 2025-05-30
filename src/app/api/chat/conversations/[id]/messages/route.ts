// src/app/api/chat/conversations/[id]/messages/route.ts - UPDATE DENGAN ATTACHMENT
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = parseInt(id);
    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    // Cek conversation access (sama seperti sebelumnya)
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        isDeleted: false, // ✅ HANYA YANG BELUM DELETED
        OR: [
          { customerId: userRole === "CUSTOMER" ? userId : undefined },
          { adminId: userRole === "ADMIN" ? userId : undefined },
          { financeId: userRole === "FINANCE" ? userId : undefined }
        ].filter(Boolean)
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // ✅ AMBIL MESSAGES DENGAN ATTACHMENTS
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            role: true 
          }
        },
        attachments: true // ✅ INCLUDE ATTACHMENTS
      },
      orderBy: { createdAt: "asc" }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json(messages);

  } catch (error: any) {
    console.error("❌ Error fetching messages:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      debug: error.message 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, attachments = [] } = body; // ✅ SUPPORT ATTACHMENTS
    const conversationId = parseInt(id);
    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    // Validasi: message atau attachment harus ada
    if (!message?.trim() && attachments.length === 0) {
      return NextResponse.json({ error: "Message or attachment is required" }, { status: 400 });
    }

    // Cek conversation access
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        isDeleted: false,
        OR: [
          { customerId: userRole === "CUSTOMER" ? userId : undefined },
          { adminId: userRole === "ADMIN" ? userId : undefined },
          { financeId: userRole === "FINANCE" ? userId : undefined }
        ].filter(Boolean)
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // ✅ BUAT MESSAGE DENGAN ATTACHMENTS
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        senderType: userRole as any,
        message: message?.trim() || null,
        attachments: {
          create: attachments.map((att: any) => ({
            fileName: att.fileName,
            originalName: att.originalName,
            fileUrl: att.fileUrl,
            fileType: att.fileType,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
            cloudinaryId: att.cloudinaryId
          }))
        }
      },
      include: {
        sender: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            role: true 
          }
        },
        attachments: true
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(newMessage);

  } catch (error: any) {
    console.error("❌ Error sending message:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      debug: error.message 
    }, { status: 500 });
  }
}