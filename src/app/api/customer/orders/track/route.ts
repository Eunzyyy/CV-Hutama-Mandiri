// src/app/api/customer/orders/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("order");

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Nomor pesanan wajib diisi" },
        { status: 400 }
      );
    }

    // Cari pesanan berdasarkan nomor pesanan
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: {
        user: {
          select: {
            name: true,
            email: true
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
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika user sudah login, pastikan dia hanya bisa melihat pesanan sendiri
    const session = await getServerSession(authOptions);
    if (session && session.user.role === "CUSTOMER") {
      const userId = parseInt(session.user.id);
      if (order.userId !== userId) {
        return NextResponse.json(
          { error: "Anda tidak memiliki akses ke pesanan ini" },
          { status: 403 }
        );
      }
    }

    // TODO: Tambahkan tracking history dari database jika ada
    // const trackingHistory = await prisma.orderTracking.findMany({
    //   where: { orderId: order.id },
    //   orderBy: { createdAt: "asc" }
    // });

    return NextResponse.json({
      order: {
        ...order,
        trackingHistory: [] // Sementara kosong, bisa diisi dari database
      }
    });

  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}