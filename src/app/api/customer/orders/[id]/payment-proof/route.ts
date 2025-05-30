// src/app/api/customer/orders/[id]/payment-proof/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const orderId = parseInt(params.id);

    // Cek apakah order milik user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { payments: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('paymentProof') as File;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // Validasi file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file harus JPG, JPEG, atau PNG" },
        { status: 400 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs');
    await mkdir(uploadDir, { recursive: true });
    
    const fileName = `${orderId}-${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/payment-proofs/${fileName}`;

    // Update atau create payment record
    let payment;
    if (order.payments && order.payments.length > 0) {
      payment = await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: {
          paymentProof: fileUrl,
          proofFileName: fileName,
          status: "PENDING_VERIFICATION"
        }
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          orderId,
          amount: order.totalAmount,
          method: order.paymentMethod || "BANK_TRANSFER",
          status: "PENDING_VERIFICATION",
          paymentProof: fileUrl,
          proofFileName: fileName
        }
      });
    }

    return NextResponse.json({
      message: "Bukti pembayaran berhasil diupload",
      paymentProof: fileUrl
    });

  } catch (error) {
    console.error("Upload payment proof error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}