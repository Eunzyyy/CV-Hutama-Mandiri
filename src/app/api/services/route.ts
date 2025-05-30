// src/app/api/services/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    console.log("=== API GET Services Called ===");
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    console.log("Services API params:", { category, search, sort });

    await prisma.$connect();
    
    // Debug: Cek semua services di database
    const allServices = await prisma.service.findMany({
      select: { id: true, name: true, isActive: true }
    });
    console.log("=== All Services in DB ===", allServices);

    const where: any = { 
      isActive: true
    };

    if (category) {
      where.category = { publicId: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    console.log("=== Where Condition ===", JSON.stringify(where, null, 2));

    let orderBy: any = { createdAt: "desc" };

    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "price_low":
        orderBy = { price: "asc" };
        break;
      case "price_high":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            publicId: true,
            name: true,
          },
        },
        images: { // ← ServiceImage relation name dari schema
          select: {
            id: true,
            url: true,
            cloudinaryPublicId: true,
          },
        },
      },
      orderBy,
    });

    console.log(`=== Found ${services.length} Services ===`);
    
    if (services.length > 0) {
      console.log("First service:", services[0]);
    }

    // ✅ PENTING: Return array langsung, bukan object!
    return NextResponse.json(services);
    
  } catch (error) {
    console.error("=== Get Services Error ===", error);
    
    // Return empty array on error
    return NextResponse.json([]);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== API Create Service Called ===");
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const categoryId = formData.get("categoryId") as string;

    console.log("Service form data received:", {
      name, description, price, categoryId
    });

    if (!name || !description || !price || !categoryId) {
      return NextResponse.json({ 
        error: "Missing required fields: name, description, price, categoryId" 
      }, { status: 400 });
    }

    await prisma.$connect();

    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!category) {
      return NextResponse.json({ 
        error: "Category not found" 
      }, { status: 400 });
    }

    if (category.type !== "SERVICE") {
      return NextResponse.json({ 
        error: "Invalid category type. Must be a SERVICE category" 
      }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            publicId: true
          }
        }
      }
    });

    console.log("✅ Service created:", service);
    
    // Handle images (UPLOAD KE CLOUDINARY)
    const images = formData.getAll("images") as File[];
    console.log(`📷 ${images.length} images to process`);
    
    // Upload images to Cloudinary and save to database
    for (const image of images) {
      if (image && image.size > 0) {
        try {
          console.log(`📤 Uploading image: ${image.name}`);
          const uploadResult = await uploadToCloudinary(image);
          
          // Save ke database dengan model ServiceImage
          await prisma.serviceImage.create({
            data: {
              url: uploadResult.secure_url,
              cloudinaryPublicId: uploadResult.public_id,
              serviceId: service.id,
            }
          });
          
          console.log(`✅ Image uploaded: ${uploadResult.secure_url}`);
        } catch (error) {
          console.error(`❌ Failed to upload image ${image.name}:`, error);
          // Continue with other images if one fails
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: service,
      message: "Service created successfully"
    });
    
  } catch (error) {
    console.error("=== Create Service Error ===", error);
    
    return NextResponse.json({ 
      error: "Failed to create service",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}