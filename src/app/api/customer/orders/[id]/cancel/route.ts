import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Cancel order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = parseInt(params.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: Number(session.user.id), // ✅ Fixed: Convert to number
      },
      include: {
        orderItems: { // ✅ Fixed: Gunakan nama field yang benar
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order can be cancelled
    if (order.status !== "PENDING") {
      return NextResponse.json({ 
        error: "Order cannot be cancelled. Current status: " + order.status 
      }, { status: 400 });
    }

    // Cancel order with transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Restore product stock
      for (const item of order.orderItems) { // ✅ Fixed: Sekarang field ini ada
        if (item.product) {
          await tx.product.update({
            where: { id: item.product.id },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        type: "ORDER_CANCELLED",
        title: "Pesanan Dibatalkan",
        message: `Pesanan #${order.orderNumber} dibatalkan oleh ${session.user.name}`,
        data: { orderId: order.id },
      },
    });

    return NextResponse.json({ message: "Order cancelled successfully" });
    
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}