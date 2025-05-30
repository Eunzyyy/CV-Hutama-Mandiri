// src/app/api/orders/[id]/route.ts - COMPLETE WORKING VERSION
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            phoneNumber: true,
            address: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                publicId: true,
                name: true,
                price: true,
                images: true,
                category: true,
              },
            },
            service: {
              select: {
                id: true,
                publicId: true,
                name: true,
                price: true,
                images: true,
                category: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          include: {
            verifier: {
              select: {
                name: true
              }
            }
          }
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check permission
    if (!["ADMIN", "OWNER", "FINANCE"].includes(session.user.role) && 
        order.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(order);
    
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Payment validation
    if (status === "PROCESSING" && currentOrder.status === "PENDING") {
      const latestPayment = currentOrder.payments[0];
      
      if (!latestPayment || latestPayment.status !== "PAID") {
        return NextResponse.json({ 
          error: "Tidak dapat memproses pesanan. Pembayaran belum dikonfirmasi.",
          details: "Pesanan hanya dapat diproses setelah pembayaran dikonfirmasi oleh tim finance."
        }, { status: 400 });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                publicId: true,
                name: true,
              },
            },
            service: {
              select: {
                id: true,
                publicId: true,
                name: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" }
        },
      },
    });

    try {
      await prisma.notification.create({
        data: {
          type: "ORDER_UPDATED",
          title: "Status Pesanan Diperbarui",
          message: `Status pesanan #${updatedOrder.orderNumber} diubah menjadi ${status}`,
          userId: updatedOrder.userId,
          data: {
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            status,
          },
        },
      });
    } catch (notificationError) {
      console.log("Notification creation failed:", notificationError);
    }

    return NextResponse.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
    
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ 
        error: "Only pending orders can be cancelled" 
      }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
    
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}