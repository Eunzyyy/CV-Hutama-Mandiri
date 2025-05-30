// src/app/api/payments/[id]/verify/route.ts
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

    // Hanya finance yang bisa verifikasi payment
    if (session.user.role !== "FINANCE") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const paymentId = parseInt(params.id);
    const { status, notes } = await request.json(); // status: "PAID" atau "REJECTED"

    if (isNaN(paymentId)) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
    }

    // Update payment dan order dalam satu transaksi
    const result = await prisma.$transaction(async (tx) => {
      // Update payment
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: status,
          verifiedAt: new Date(),
          verifierId: parseInt(session.user.id),
          notes: notes || null
        },
        include: {
          order: true
        }
      });

      // Update order status jika payment berhasil
      if (status === "PAID") {
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: "PAID",
            status: "COMPLETED", // 🔥 INI YANG PENTING!
            updatedAt: new Date()
          }
        });
      }

      return payment;
    });

    // 🔥 PENTING: Revalidate dashboard cache
    revalidatePath('/finance');
    revalidatePath('/owner');
    revalidatePath('/api/finance/dashboard');
    revalidatePath('/api/owner/dashboard');

    return NextResponse.json({
      message: "Payment berhasil diverifikasi",
      payment: result
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}