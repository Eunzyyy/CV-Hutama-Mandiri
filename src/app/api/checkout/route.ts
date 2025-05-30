// src/app/api/checkout/route.ts - FIXED
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id); // ✅ Convert to number
    const body = await request.json();
    const { cartId, paymentMethod, notes, customerDesign } = body;

    if (!cartId) {
      return NextResponse.json(
        { message: "Cart ID diperlukan" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { message: "Metode pembayaran diperlukan" },
        { status: 400 }
      );
    }

    // ✅ Fix the query - remove invalid fields
    const cart = await prisma.order.findUnique({
      where: {
        id: Number(cartId),
        userId,
        status: "PENDING",
        // ✅ Remove invalid orderNumber filter - use simple string comparison in code
      },
      include: {
        orderItems: true, // ✅ Change from items to orderItems
      },
    });

    if (!cart) {
      return NextResponse.json(
        { message: "Cart tidak ditemukan" },
        { status: 404 }
      );
    }

    // ✅ Check if it's a cart (orderNumber starts with CART-)
    if (!cart.orderNumber.startsWith("CART-")) {
      return NextResponse.json(
        { message: "Cart tidak valid" },
        { status: 400 }
      );
    }

    if (cart.orderItems.length === 0) { // ✅ Change from items to orderItems
      return NextResponse.json(
        { message: "Cart kosong" },
        { status: 400 }
      );
    }

    const orderNumber = `ORDER-${Date.now()}-${userId}`;

    // ✅ Fix the update data
    const order = await prisma.order.update({
      where: {
        id: Number(cartId),
      },
      data: {
        orderNumber,
        paymentMethod,
        notes,
        // ✅ Remove customerDesign if not in schema, or add to schema
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Checkout berhasil",
      order,
    });
  } catch (error) {
    console.error("Error checkout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}