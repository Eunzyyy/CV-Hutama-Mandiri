// src/app/api/owner/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.message = { contains: search, mode: 'insensitive' };
    }

    if (level && level !== "ALL") {
      whereClause.level = level;
    }

    // Since we don't have a logs table in schema, let's create mock data
    // In real implementation, you would have a proper logging system
    const mockLogs = [
      {
        id: 1,
        level: "INFO",
        message: "User login successful",
        context: { userId: 1, ip: "192.168.1.1" },
        createdAt: new Date().toISOString(),
        userId: 1,
        userName: "John Doe"
      },
      {
        id: 2,
        level: "ERROR",
        message: "Database connection failed",
        context: { error: "Connection timeout" },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        userId: null,
        userName: null
      },
      {
        id: 3,
        level: "WARNING",
        message: "High memory usage detected",
        context: { usage: "85%" },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        userId: null,
        userName: null
      }
    ];

    // Filter mock data
    let filteredLogs = mockLogs;
    if (search) {
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (level && level !== "ALL") {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    const totalLogs = filteredLogs.length;
    const logs = filteredLogs.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalLogs / limit);

    return NextResponse.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs,
        limit
      }
    });

  } catch (error) {
    console.error("Logs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}