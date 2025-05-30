// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Ambil semua settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    const settings = await prisma.setting.findMany({
      orderBy: {
        key: "asc",
      },
    });

    // Convert to key-value object for easier use
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      settings: settingsObject,
      rawSettings: settings, // untuk admin yang perlu format asli
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
      { status: 500 }
    );
  }
}

// POST - Update multiple settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Data settings tidak valid" },
        { status: 400 }
      );
    }

    const updatedSettings = [];

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === "string") {
        const setting = await prisma.setting.upsert({
          where: { key },
          update: {
            value,
            updatedAt: new Date(),
          },
          create: {
            key,
            value,
            description: `Setting for ${key}`,
          },
        });
        updatedSettings.push(setting);
      }
    }

    return NextResponse.json({
      message: "Pengaturan berhasil disimpan",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}