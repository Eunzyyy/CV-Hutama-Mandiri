// src/app/api/owner/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const exportType = searchParams.get("type") || "users";

    let data: any[] = [];
    let filename = "";

    switch (exportType) {
      case "users":
        data = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            _count: {
              select: {
                orders: true,
                reviews: true
              }
            }
          }
        });
        filename = "users-export";
        break;

      case "orders":
        data = await prisma.order.findMany({
          include: {
            user: {
              select: { name: true, email: true }
            },
            payments: {
              select: { status: true, method: true, amount: true }
            }
          }
        });
        filename = "orders-export";
        break;

      case "products":
        data = await prisma.product.findMany({
          include: {
            category: {
              select: { name: true }
            },
            _count: {
              select: {
                orderItems: true,
                reviews: true
              }
            }
          }
        });
        filename = "products-export";
        break;

      case "payments":
        data = await prisma.payment.findMany({
          include: {
            order: {
              select: {
                orderNumber: true,
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        });
        filename = "payments-export";
        break;

      default:
        return NextResponse.json(
          { error: "Invalid export type" },
          { status: 400 }
        );
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Flatten data for Excel export
    const flattenedData = data.map(item => {
      const flattened: any = {};
      
      const flatten = (obj: any, prefix = '') => {
        for (const key in obj) {
          if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
            flatten(obj[key], prefix + key + '_');
          } else {
            flattened[prefix + key] = obj[key];
          }
        }
      };
      
      flatten(item);
      return flattened;
    });

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, exportType);

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}