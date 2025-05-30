// src/app/api/chat/conversations/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, subject, message } = body;
    const adminId = parseInt(session.user.id);

    if (!customerId || !message?.trim()) {
      return NextResponse.json({ error: "Customer ID dan pesan harus diisi" }, { status: 400 });
    }

    const customerIdInt = parseInt(customerId);

    // Cek apakah customer exists
    const customer = await prisma.user.findFirst({
      where: { id: customerIdInt, role: "CUSTOMER" },
      select: { id: true, name: true, email: true }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 400 });
    }

    // Cek apakah sudah ada conversation antara admin ini dan customer
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        customerId: customerIdInt,
        adminId: adminId,
        isDeleted: false
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        finance: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, name: true, email: true } }
      }
    });

    if (existingConversation) {
      // Kirim message ke conversation yang sudah ada
      await prisma.message.create({
        data: {
          conversationId: existingConversation.id,
          senderId: adminId,
          senderType: "ADMIN",
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
        isExisting: true
      });
    }

    // Buat conversation baru
    const conversation = await prisma.conversation.create({
      data: {
        customerId: customerIdInt,
        adminId: adminId,
        subject: subject || `Chat dengan ${customer.name}`,
        status: "ACTIVE"
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        finance: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, name: true, email: true } }
      }
    });

    // Buat first message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: adminId,
        senderType: "ADMIN",
        message: message.trim()
      }
    });

    return NextResponse.json({
      success: true,
      conversation,
      isExisting: false
    });

  } catch (error: any) {
    console.error("❌ Error creating admin conversation:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}