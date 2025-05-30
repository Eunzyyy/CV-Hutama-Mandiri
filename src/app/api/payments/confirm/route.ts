// src/app/api/payments/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Payment Confirmation API Called ===");
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", session.user.id);

    const formData = await request.formData();
    const orderId = parseInt(formData.get("orderId") as string);
    const amount = parseFloat(formData.get("amount") as string);
    const paymentProofFile = formData.get("paymentProof") as File;

    console.log("Form data received:", {
      orderId,
      amount,
      fileName: paymentProofFile?.name,
      fileSize: paymentProofFile?.size
    });

    if (!orderId || !amount || !paymentProofFile) {
      return NextResponse.json({ 
        error: "Data tidak lengkap. Harap isi semua field." 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (paymentProofFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "File terlalu besar. Maksimal 10MB" 
      }, { status: 400 });
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: parseInt(session.user.id)
      },
      include: {
        payments: true
      }
    });

    if (!order) {
      return NextResponse.json({ 
        error: "Pesanan tidak ditemukan atau bukan milik Anda" 
      }, { status: 404 });
    }

    console.log("Order found:", order.orderNumber);

    // Upload file to Cloudinary
    console.log("Uploading to Cloudinary...");
    const uploadResult = await uploadToCloudinary(paymentProofFile);
    console.log("Upload success:", uploadResult.secure_url);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: orderId,
        amount: amount,
        method: order.paymentMethod || 'BANK_TRANSFER',
        status: 'PENDING_VERIFICATION',
        paymentProof: uploadResult.secure_url,
        proofFileName: paymentProofFile.name,
        notes: `Bukti pembayaran diunggah oleh customer pada ${new Date().toLocaleString('id-ID')}`
      }
    });

    console.log("Payment record created:", payment.id);

    // Create notification for admin/finance
    try {
      await prisma.notification.create({
        data: {
          type: "PAYMENT_UPLOADED",
          title: "Bukti Pembayaran Baru",
          message: `Bukti pembayaran untuk order #${order.orderNumber} menunggu verifikasi`,
          data: {
            orderId: order.id,
            paymentId: payment.id,
            orderNumber: order.orderNumber,
            amount: amount
          }
        }
      });
      console.log("Notification created");
    } catch (notifError) {
      console.log("Notification creation failed:", notifError);
    }

    return NextResponse.json({
      success: true,
      message: "Bukti pembayaran berhasil diunggah dan menunggu verifikasi",
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        uploadedAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error("=== Payment Confirmation Error ===", error);
    return NextResponse.json({ 
      error: "Gagal mengunggah bukti pembayaran. Silakan coba lagi." 
    }, { status: 500 });
  }
}