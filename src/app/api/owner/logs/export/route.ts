// src/app/api/owner/logs/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const level = searchParams.get("level") || "";
    const search = searchParams.get("search") || "";

    // Mock logs data - replace with actual log retrieval
    const mockLogs = [
      {
        id: 1,
        level: "INFO",
        message: "User login successful",
        context: '{"userId": 1, "ip": "192.168.1.1"}',
        createdAt: new Date().toISOString(),
        userName: "John Doe"
      },
      {
        id: 2,
        level: "ERROR",
        message: "Database connection failed",
        context: '{"error": "Connection timeout"}',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        userName: "System"
      },
      {
        id: 3,
        level: "WARNING",
        message: "High memory usage detected",
        context: '{"usage": "85%"}',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        userName: "System"
      }
    ];

    // Filter logs
    let filteredLogs = mockLogs;
    if (search) {
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (level && level !== "ALL") {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    // Create CSV content
    let csvContent = 'ID,Level,Message,Context,User,Created At\n';
    
    filteredLogs.forEach(log => {
      const row = [
        log.id,
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        `"${log.context.replace(/"/g, '""')}"`,
        log.userName || 'System',
        log.createdAt
      ].join(',');
      csvContent += row + '\n';
    });

    const csvBuffer = Buffer.from(csvContent, 'utf8');

    return new NextResponse(csvBuffer, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error("Logs export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}