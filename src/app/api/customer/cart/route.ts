// src/app/api/customer/cart/route.ts - FIXED
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: {
              select: {
                publicId: true,
                name: true,
                price: true,
                stock: true,
                images: {
                  take: 1,
                  select: { url: true }
                }
              }
            },
            service: {
              select: {
                publicId: true,
                name: true,
                price: true,
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

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          cartItems: {
            include: {
              product: {
                select: {
                  publicId: true,
                  name: true,
                  price: true,
                  stock: true,
                  images: {
                    take: 1,
                    select: { url: true }
                  }
                }
              },
              service: {
                select: {
                  publicId: true,
                  name: true,
                  price: true,
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
    }

    const totalAmount = cart.cartItems.reduce((total: number, item: any) => {
      const price = item.product?.price || item.service?.price || 0;
      return total + (price * item.quantity);
    }, 0);

    return NextResponse.json({
      cart: {
        id: cart.id,
        totalAmount,
        itemCount: cart.cartItems.length,
        items: cart.cartItems
      }
    });

  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await req.json();
    const { productId, serviceId, quantity } = body;

    if (!productId && !serviceId) {
      return NextResponse.json(
        { error: "Product ID atau Service ID wajib diisi" },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity minimal 1" },
        { status: 400 }
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    if (productId) {
      const product = await prisma.product.findFirst({
        where: { 
          publicId: productId,
          isActive: true
        },
        select: { id: true, stock: true, name: true, price: true } // ✅ Add price
      });

      if (!product) {
        return NextResponse.json(
          { error: "Produk tidak ditemukan atau tidak aktif" },
          { status: 404 }
        );
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          { error: `Stok ${product.name} tidak mencukupi. Stok tersedia: ${product.stock}` },
          { status: 400 }
        );
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: product.id
        }
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          return NextResponse.json(
            { error: `Total quantity melebihi stok. Stok tersedia: ${product.stock}` },
            { status: 400 }
          );
        }

        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity }
        });
      } else {
        // ✅ Add price field
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity,
            price: product.price // ✅ Required field
          }
        });
      }
    }

    if (serviceId) {
      const service = await prisma.service.findFirst({
        where: { 
          publicId: serviceId,
          isActive: true
        },
        select: { id: true, name: true, price: true } // ✅ Add price
      });

      if (!service) {
        return NextResponse.json(
          { error: "Jasa tidak ditemukan atau tidak aktif" },
          { status: 404 }
        );
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          serviceId: service.id
        }
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        // ✅ Add price field
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            serviceId: service.id,
            quantity,
            price: service.price // ✅ Required field
          }
        });
      }
    }

    return NextResponse.json({
      message: "Item berhasil ditambahkan ke keranjang"
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await req.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Cart item ID dan quantity wajib diisi" },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId }
      },
      include: {
        product: {
          select: { stock: true, name: true }
        },
        service: {
          select: { name: true }
        }
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Item tidak ditemukan di keranjang" },
        { status: 404 }
      );
    }

    if (cartItem.product && quantity > cartItem.product.stock) {
      return NextResponse.json(
        { error: `Quantity melebihi stok. Stok tersedia: ${cartItem.product.stock}` },
        { status: 400 }
      );
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });

    return NextResponse.json({
      message: "Quantity berhasil diperbarui"
    });

  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("itemId");

    if (!cartItemId) {
      return NextResponse.json(
        { error: "Cart item ID wajib diisi" },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(cartItemId),
        cart: { userId }
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Item tidak ditemukan di keranjang" },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(cartItemId) }
    });

    return NextResponse.json({
      message: "Item berhasil dihapus dari keranjang"
    });

  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}