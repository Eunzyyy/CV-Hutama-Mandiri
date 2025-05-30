// src/app/api/orders/route.ts - COMPLETE FULL VERSION
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface ValidatedItem {
  productId: number | null;
  serviceId: number | null;
  quantity: number;
  price: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      userId,
      items, 
      totalAmount, 
      paymentMethod,
      shippingAddress, 
      notes 
    } = await request.json();

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    // Determine user ID for the order
    let orderUserId = parseInt(session.user.id);
    
    if (userId && ["ADMIN", "OWNER"].includes(session.user.role)) {
      orderUserId = parseInt(userId);
    }

    if (isNaN(orderUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    let calculatedTotal = 0;
    const validatedItems: ValidatedItem[] = [];

    // Validate and calculate total for each item
    for (const item of items) {
      if (item.type === 'product' && item.id) {
        const product = await prisma.product.findUnique({
          where: { id: item.id }
        });
        
        if (!product) {
          return NextResponse.json({ 
            error: `Product with ID ${item.id} not found` 
          }, { status: 404 });
        }
        
        if (product.stock < item.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
          }, { status: 400 });
        }

        validatedItems.push({
          productId: product.id,
          serviceId: null,
          quantity: item.quantity,
          price: product.price
        });

        calculatedTotal += product.price * item.quantity;

      } else if (item.type === 'service' && item.id) {
        const service = await prisma.service.findUnique({
          where: { id: item.id }
        });
        
        if (!service) {
          return NextResponse.json({ 
            error: `Service with ID ${item.id} not found` 
          }, { status: 404 });
        }

        validatedItems.push({
          productId: null,
          serviceId: service.id,
          quantity: item.quantity,
          price: service.price
        });

        calculatedTotal += service.price * item.quantity;
      } else {
        return NextResponse.json({ 
          error: `Invalid item: ${JSON.stringify(item)}` 
        }, { status: 400 });
      }
    }

    // Verify calculated total matches provided total
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return NextResponse.json({ 
        error: `Total amount mismatch. Calculated: ${calculatedTotal}, Provided: ${totalAmount}` 
      }, { status: 400 });
    }

    // Create order with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: orderUserId,
          totalAmount: calculatedTotal,
          status: "PENDING",
          paymentMethod: paymentMethod || null,
          shippingAddress: shippingAddress?.trim() || null,
          notes: notes?.trim() || null,
        },
      });

      // Create order items and update stock
      for (const item of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            serviceId: item.serviceId,
            quantity: item.quantity,
            price: item.price
          }
        });

        // Update product stock if it's a product
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // ✅ Create ONLY ONE payment if payment method is provided
      if (paymentMethod) {
        // Double-check no payment exists for this order
        const existingPayment = await tx.payment.findFirst({
          where: { orderId: newOrder.id }
        });

        if (!existingPayment) {
          await tx.payment.create({
            data: {
              orderId: newOrder.id,
              amount: calculatedTotal,
              method: paymentMethod,
              status: "PENDING",
              notes: `Payment for order ${orderNumber}`
            }
          });
        }
      }

      return newOrder;
    });

    // Create notification (outside transaction to avoid rollback issues)
    try {
      await prisma.notification.create({
        data: {
          type: "ORDER_CREATED",
          title: "Pesanan Baru",
          message: `Pesanan baru #${orderNumber} telah dibuat`,
          data: { 
            orderId: result.id,
            orderNumber,
            totalAmount: calculatedTotal
          },
        },
      });
    } catch (notificationError) {
      console.log("Notification creation failed:", notificationError);
      // Don't fail the order creation if notification fails
    }

    // Fetch the complete order with all relations
    const fullOrder = await prisma.order.findUnique({
      where: { id: result.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            phoneNumber: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            },
            service: {
              include: {
                images: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    return NextResponse.json({ 
      message: "Order berhasil dibuat", 
      order: fullOrder,
      orderNumber: orderNumber
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating order:", error);
    
    // Return more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: "Order number already exists. Please try again." 
        }, { status: 409 });
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ 
          error: "Invalid reference to product, service, or user." 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Build where clause
    let where: any = {};

    // Role-based access control
    if (!["ADMIN", "OWNER", "FINANCE"].includes(session.user.role)) {
      where.userId = userId;
    }

    // Status filter
    if (status && status !== "all") {
      where.status = status;
    }

    // Search filter
    if (search) {
      if (["ADMIN", "OWNER", "FINANCE"].includes(session.user.role)) {
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } }
        ];
      } else {
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    // Build sort object
    let orderBy: any = {};
    if (sortBy === "user") {
      orderBy = { user: { name: sortOrder } };
    } else if (sortBy === "totalAmount") {
      orderBy = { totalAmount: sortOrder };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    // Execute queries
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              phoneNumber: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  publicId: true,
                  name: true,
                  price: true,
                  images: {
                    take: 1,
                    select: { url: true },
                  },
                  category: {
                    select: {
                      name: true,
                      type: true
                    }
                  }
                },
              },
              service: {
                select: {
                  id: true,
                  publicId: true,
                  name: true,
                  price: true,
                  images: {
                    take: 1,
                    select: { url: true },
                  },
                  category: {
                    select: {
                      name: true,
                      type: true
                    }
                  }
                },
              },
            },
          },
          // ✅ Include latest payment data for status checking
          payments: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              createdAt: true,
              paymentProof: true,
              verifiedAt: true,
              verifier: {
                select: {
                  name: true
                }
              }
            }
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Add computed fields
    const ordersWithComputedFields = orders.map(order => ({
      ...order,
      itemCount: order.orderItems.length,
      hasPayment: order.payments.length > 0,
      latestPaymentStatus: order.payments[0]?.status || null,
      canProcess: order.status === "PENDING" && order.payments[0]?.status === "PAID"
    }));

    return NextResponse.json({
      orders: ordersWithComputedFields,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        status,
        search,
        sortBy,
        sortOrder
      }
    });
    
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// ✅ Optional: Add PATCH method for bulk operations
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, orderIds, data } = await request.json();

    if (!action || !orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({ 
        error: "Action and orderIds array are required" 
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case "bulk_status_update":
        if (!data?.status) {
          return NextResponse.json({ 
            error: "Status is required for bulk update" 
          }, { status: 400 });
        }

        result = await prisma.order.updateMany({
          where: {
            id: { in: orderIds },
            status: { in: ["PENDING", "PROCESSING"] } // Only allow certain status updates
          },
          data: {
            status: data.status,
            updatedAt: new Date()
          }
        });
        break;

      case "bulk_delete":
        result = await prisma.order.updateMany({
          where: {
            id: { in: orderIds },
            status: "PENDING" // Only allow deleting pending orders
          },
          data: {
            status: "CANCELLED",
            updatedAt: new Date()
          }
        });
        break;

      default:
        return NextResponse.json({ 
          error: `Unknown action: ${action}` 
        }, { status: 400 });
    }

    return NextResponse.json({
      message: `Bulk ${action} completed`,
      affected: result.count,
      orderIds
    });

  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}