import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["FINANCE", "ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const format = searchParams.get("format") || "csv";

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "ALL") {
      where.status = status;
    }

    // Get all payments for export
    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Order Number",
        "Customer Name",
        "Customer Email",
        "Amount",
        "Method",
        "Status",
        "Created At",
        "Updated At",
      ];

      const csvData = payments.map((payment) => [
        payment.order.orderNumber,
        payment.order.user.name,
        payment.order.user.email,
        payment.amount,
        payment.method,
        payment.status,
        payment.createdAt.toISOString(),
        payment.updatedAt.toISOString(),
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=payments.csv",
        },
      });
    }

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error exporting payments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}