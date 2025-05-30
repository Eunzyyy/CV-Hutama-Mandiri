// src/app/api/chat/conversations/[id]/route.ts - DELETE CONVERSATION
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
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

    // Cek apakah user bisa delete conversation ini
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

    // ✅ SOFT DELETE - mark as deleted
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        isDeleted: true,
        deletedBy: userId,
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Conversation deleted successfully" 
    });

  } catch (error: any) {
    console.error("❌ Error deleting conversation:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      debug: error.message 
    }, { status: 500 });
  }
}