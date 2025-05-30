// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    console.log("=== API Create Product Called ===");
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log("❌ No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "OWNER"].includes(session.user.role)) {
      console.log("❌ Access denied for role:", session.user.role);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("✅ User authenticated:", session.user.email);

    // Parse FormData dengan error handling
    let formData;
    try {
      formData = await request.formData();
      console.log("✅ FormData parsed successfully");
    } catch (error) {
      console.error("❌ Error parsing FormData:", error);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const stock = formData.get("stock") as string;
    const categoryId = formData.get("categoryId") as string;
    const sku = formData.get("sku") as string;
    const weight = formData.get("weight") as string;
    const weightUnit = formData.get("weightUnit") as string;

    console.log("📝 Form data received:", {
      name, description, price, stock, categoryId, sku, weight, weightUnit
    });

    // Validasi input yang lebih detail
    if (!name || name.trim() === "") {
      console.log("❌ Missing name");
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    if (!description || description.trim() === "") {
      console.log("❌ Missing description");
      return NextResponse.json({ error: "Product description is required" }, { status: 400 });
    }

    if (!price || isNaN(parseFloat(price))) {
      console.log("❌ Invalid price:", price);
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }

    if (!stock || isNaN(parseInt(stock))) {
      console.log("❌ Invalid stock:", stock);
      return NextResponse.json({ error: "Valid stock is required" }, { status: 400 });
    }

    if (!categoryId || isNaN(parseInt(categoryId))) {
      console.log("❌ Invalid categoryId:", categoryId);
      return NextResponse.json({ error: "Valid category is required" }, { status: 400 });
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log("✅ Database connected");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Cek apakah category ada
    let category;
    try {
      category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });
      console.log("🔍 Category lookup result:", category);
    } catch (error) {
      console.error("❌ Error finding category:", error);
      return NextResponse.json({ error: "Error checking category" }, { status: 500 });
    }

    if (!category) {
      console.log("❌ Category not found with ID:", categoryId);
      
      // List available categories for debugging
      const availableCategories = await prisma.category.findMany({
        where: { type: 'PRODUCT' },
        select: { id: true, name: true }
      });
      console.log("📋 Available categories:", availableCategories);
      
      return NextResponse.json({ 
        error: `Category not found. Available categories: ${availableCategories.map(c => `${c.name} (ID: ${c.id})`).join(', ')}` 
      }, { status: 400 });
    }

    if (category.type !== "PRODUCT") {
      console.log("❌ Wrong category type:", category.type);
      return NextResponse.json({ 
        error: "Invalid category type. Must be a PRODUCT category" 
      }, { status: 400 });
    }

    // Convert weight to grams
    let weightInGrams = null;
    if (weight && !isNaN(parseFloat(weight))) {
      const weightValue = parseFloat(weight);
      switch (weightUnit) {
        case "kg":
          weightInGrams = weightValue * 1000;
          break;
        case "ton":
          weightInGrams = weightValue * 1000000;
          break;
        default: // gram
          weightInGrams = weightValue;
      }
      console.log(`📏 Weight converted: ${weight} ${weightUnit} = ${weightInGrams} grams`);
    }

    // Create product
    let product;
    try {
      product = await prisma.product.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          stock: parseInt(stock),
          sku: sku?.trim() || null,
          weight: weightInGrams,
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
      console.log("✅ Product created successfully:", product);
    } catch (error) {
      console.error("❌ Error creating product:", error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        return NextResponse.json({ error: "Product with this SKU already exists" }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: "Failed to create product", 
        details: error.message 
      }, { status: 500 });
    }
    
    // Handle images (UPLOAD KE CLOUDINARY)
    const images = formData.getAll("images") as File[];
    console.log(`📷 ${images.length} images to process`);
    
    // Upload images to Cloudinary and save to database
    for (const image of images) {
      if (image && image.size > 0) {
        try {
          console.log(`📤 Uploading image: ${image.name}`);
          const uploadResult = await uploadToCloudinary(image);
          
          // Save ke database dengan model ProductImage
          await prisma.productImage.create({
            data: {
              url: uploadResult.secure_url,
              cloudinaryPublicId: uploadResult.public_id,
              productId: product.id,
            }
          });
          
          console.log(`✅ Image uploaded: ${uploadResult.secure_url}`);
        } catch (error) {
          console.error(`❌ Failed to upload image ${image.name}:`, error);
          // Continue with other images if one fails
        }
      }
    }
    
    const response = {
      success: true,
      data: product,
      message: "Product created successfully",
      publicId: product.publicId
    };

    console.log("✅ Returning success response:", response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("=== Unexpected Error in Create Product ===", error);
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
      console.log("✅ Database disconnected");
    } catch (error) {
      console.error("❌ Error disconnecting database:", error);
    }
  }
}

// GET method - UPDATE UNTUK GUNAKAN ProductImage
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    await prisma.$connect();

    const where: any = { isActive: true };

    if (category) {
      where.category = { publicId: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            publicId: true,
            name: true,
          },
        },
        images: { // ← ProductImage relation name dari schema
          select: {
            id: true,
            url: true,
            cloudinaryPublicId: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
    
  } catch (error) {
    console.error("=== Get Products Error ===", error);
    return NextResponse.json([]);
  } finally {
    await prisma.$disconnect();
  }
}