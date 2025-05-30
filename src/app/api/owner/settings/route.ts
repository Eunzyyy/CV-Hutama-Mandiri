// src/app/api/owner/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const settings = await prisma.setting.findMany();
    
    // Convert to object format
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as any);

    // Default values if not exist
    const defaultSettings = {
      company_name: "CV Hutama Mandiri Indotech",
      company_address: "Jl. Raya Binong No. 79 Kamp. Parigi Sukabakti, Curug, Tangerang 15810",
      company_phone: "021-5983117",
      company_email: "info@hutama.com",
      tax_rate: "11",
      currency: "IDR",
      timezone: "Asia/Jakarta",
      email_notifications: "enabled",
      order_auto_status: "disabled",
      maintenance_mode: "off",
      ...settingsObj
    };

    return NextResponse.json(defaultSettings);

  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const settings = await req.json();

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { 
          key, 
          value: String(value),
          description: `System setting for ${key}`
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}