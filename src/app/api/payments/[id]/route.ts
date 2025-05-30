// src/app/api/finance/payments/[id]/route.ts
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
    
    if (!session || !["FINANCE", "ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentId = parseInt(params.id);
    if (isNaN(paymentId)) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
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
                phone: true,
                phoneNumber: true,
              }
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: {
                      select: { url: true },
                      take: 1
                    }
                  }
                },
                service: {
                  select: {
                    name: true,
                    images: {
                      select: { url: true },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        },
        verifier: {
          select: {
            name: true
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["FINANCE", "ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentId = parseInt(params.id);
    const { status } = await request.json();

    if (!["PAID", "FAILED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const payment = await prisma.$transaction(async (tx) => {
      // Update payment
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          verifiedAt: status === "PAID" ? new Date() : null,
          verifiedBy: status === "PAID" ? parseInt(session.user.id) : null,
        }
      });

      // Update order status if payment is confirmed
      if (status === "PAID") {
        await tx.order.update({
          where: { id: updatedPayment.orderId },
          data: { status: "PROCESSING" }
        });
      }

      return updatedPayment;
    });

    // Create notification
    try {
      await prisma.notification.create({
        data: {
          type: "PAYMENT_CONFIRMED",
          title: "Pembayaran Dikonfirmasi",
          message: `Pembayaran untuk order telah ${status === "PAID" ? "dikonfirmasi" : "ditolak"}`,
          data: { paymentId, orderId: payment.orderId },
        },
      });
    } catch (notificationError) {
      console.log("Notification creation failed:", notificationError);
    }

    return NextResponse.json({ message: "Payment status updated successfully" });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}