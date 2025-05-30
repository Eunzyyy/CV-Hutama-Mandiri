// src/app/api/reviews/[id]/route.ts - FIXED
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = parseInt(params.id);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data review" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 401 }
      );
    }

    const reviewId = parseInt(params.id);
    const body = await request.json();
    const { rating, comment } = body;

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating harus antara 1-5" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review tidak ditemukan" },
        { status: 404 }
      );
    }

    const canUpdateAnyReview = ["ADMIN", "OWNER"].includes(session.user.role);
    const isOwnReview = existingReview.userId === parseInt(session.user.id); // ✅ Convert to number

    if (!canUpdateAnyReview && !isOwnReview) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment }),
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
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 401 }
      );
    }

    const reviewId = parseInt(params.id);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review tidak ditemukan" },
        { status: 404 }
      );
    }

    const canDeleteAnyReview = ["ADMIN", "OWNER"].includes(session.user.role);
    const isOwnReview = review.userId === parseInt(session.user.id); // ✅ Convert to number

    if (!canDeleteAnyReview && !isOwnReview) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "Review berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Gagal menghapus review" },
      { status: 500 }
    );
  }
}