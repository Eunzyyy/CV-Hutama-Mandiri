import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["FINANCE", "ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalPayments,
      totalAmountResult,
      pendingAmountResult,
      completedAmountResult,
      failedCount,
    ] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: { status: "FAILED" },
      }),
    ]);

    const stats = {
      totalPayments,
      totalAmount: totalAmountResult._sum.amount || 0,
      pendingAmount: pendingAmountResult._sum.amount || 0,
      completedAmount: completedAmountResult._sum.amount || 0,
      failedCount,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}