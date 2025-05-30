// src/app/api/finance/payments/[id]/route.ts - COMPLETE FIXED VERSION
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "FINANCE", "OWNER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const paymentId = parseInt(params.id);
    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: {
                      take: 1,
                      select: { url: true }
                    }
                  }
                },
                service: {
                  select: {
                    name: true,
                    images: {
                      take: 1,
                      select: { url: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);

  } catch (error) {
    console.error("Get payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "FINANCE", "OWNER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const paymentId = parseInt(params.id);
    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const { status, notes } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "PENDING_VERIFICATION", "PAID", "FAILED", "CANCELLED", "REFUNDED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get current payment info
    const currentPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            userId: true
          }
        }
      }
    });

    if (!currentPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        notes: notes || currentPayment.notes,
        updatedAt: new Date()
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // Create notification for payment status update
    try {
      await prisma.notification.create({
        data: {
          type: "PAYMENT_STATUS_UPDATED",
          title: "Status Pembayaran Diperbarui",
          message: `Pembayaran untuk order #${currentPayment.order.orderNumber} telah ${status === 'PAID' ? 'dikonfirmasi' : 'diperbarui'}`,
          userId: currentPayment.order.userId,
          data: {
            orderId: currentPayment.order.id,
            paymentId: paymentId,
            paymentStatus: status,
            orderNumber: currentPayment.order.orderNumber
          }
        }
      });
    } catch (notificationError) {
      console.log("Notification creation failed:", notificationError);
    }

    return NextResponse.json({
      message: "Payment status updated successfully",
      payment: updatedPayment
    });

  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}