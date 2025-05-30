// src/app/api/chat/conversations/admin/finance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "FINANCE") {
      return NextResponse.json({ 
        error: "Unauthorized", 
        success: false 
      }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, subject, message } = body;
    const financeId = parseInt(session.user.id);

    console.log("=== FINANCE CHAT CREATE ===");
    console.log("Finance ID:", financeId);
    console.log("Customer ID:", customerId);
    console.log("Message:", message);

    if (!customerId || !message?.trim()) {
      return NextResponse.json({ 
        error: "Customer ID dan pesan harus diisi",
        success: false 
      }, { status: 400 });
    }

    const customerIdInt = parseInt(customerId);

    // Cek apakah customer exists
    const customer = await prisma.user.findFirst({
      where: { 
        id: customerIdInt, 
        role: "CUSTOMER" 
      },
      select: { 
        id: true, 
        name: true, 
        email: true 
      }
    });

    if (!customer) {
      return NextResponse.json({ 
        error: "Customer tidak ditemukan",
        success: false 
      }, { status: 404 });
    }

    console.log("✅ Customer found:", customer.name);

    // Cek apakah sudah ada conversation antara finance ini dan customer
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        customerId: customerIdInt,
        financeId: financeId,
        isDeleted: false
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        finance: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (existingConversation) {
      console.log("✅ Using existing conversation:", existingConversation.id);
      
      // Kirim message ke conversation yang sudah ada
      const newMessage = await prisma.message.create({
        data: {
          conversationId: existingConversation.id,
          senderId: financeId,
          senderType: "FINANCE",
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
        message: newMessage
      });
    }

    console.log("✅ Creating new conversation");

    // Buat conversation baru
    const conversation = await prisma.conversation.create({
      data: {
        customerId: customerIdInt,
        financeId: financeId,
        subject: subject || `Chat Finance dengan ${customer.name}`,
        status: "ACTIVE"
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        finance: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, name: true, email: true } },
        messages: true
      }
    });

    // Buat first message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: financeId,
        senderType: "FINANCE",
        message: message.trim()
      }
    });

    console.log("✅ Conversation created:", conversation.id);

    return NextResponse.json({
      success: true,
      conversation,
      isExisting: false,
      message: newMessage
    });

  } catch (error: any) {
    console.error("❌ Error creating finance conversation:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message,
      success: false
    }, { status: 500 });
  }
}