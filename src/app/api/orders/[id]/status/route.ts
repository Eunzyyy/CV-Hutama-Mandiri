// src/app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hanya admin, owner, atau finance yang bisa update status
    if (!["ADMIN", "OWNER", "FINANCE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const orderId = parseInt(params.id);
    const { status, paymentStatus } = await request.json();

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        paymentStatus: paymentStatus,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        orderItems: {
          include: {
            product: { select: { name: true } },
            service: { select: { name: true } }
          }
        }
      }
    });

    // 🔥 PENTING: Revalidate dashboard cache
    revalidatePath('/owner');
    revalidatePath('/finance');
    revalidatePath('/api/owner/dashboard');
    revalidatePath('/api/finance/dashboard');

    // Buat notifikasi
    try {
      await prisma.notification.create({
        data: {
          type: "ORDER_STATUS_UPDATED",
          title: "Status Pesanan Diupdate",
          message: `Pesanan #${updatedOrder.orderNumber} diupdate ke ${status}`,
          data: { 
            orderId: updatedOrder.id,
            status: status,
            paymentStatus: paymentStatus
          }
        }
      });
    } catch (error) {
      console.log("Notification error:", error);
    }

    return NextResponse.json({
      message: "Status order berhasil diupdate",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}