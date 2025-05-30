//src/app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import cloudinary from "@/lib/cloudinary";

// Helper function untuk mencari service
async function findService(identifier: string) {
  console.log('Finding service with identifier:', identifier);
  
  // Coba cari berdasarkan publicId dulu
  let service = await prisma.service.findUnique({
    where: { publicId: identifier },
    include: {
      category: {
        select: {
          id: true,
          publicId: true,
          name: true,
        },
      },
      images: { // ← ServiceImage relation
        select: {
          id: true,
          url: true,
          cloudinaryPublicId: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  console.log('Service found by publicId:', service ? 'YES' : 'NO');

  // Jika tidak ketemu dan identifier adalah angka, coba cari berdasarkan id
  if (!service && !isNaN(Number(identifier))) {
    console.log('Trying to find by regular id:', identifier);
    service = await prisma.service.findUnique({
      where: { id: parseInt(identifier) },
      include: {
        category: {
          select: {
            id: true,
            publicId: true,
            name: true,
          },
        },
        images: { // ← ServiceImage relation
          select: {
            id: true,
            url: true,
            cloudinaryPublicId: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    console.log('Service found by id:', service ? 'YES' : 'NO');
  }

  return service;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET request for service ID:', params.id);
    
    const service = await findService(params.id);

    if (!service) {
      console.log('Service not found with identifier:', params.id);
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    console.log('Service found, returning data');
    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== Update Service API Called ===", params.id);
    
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const categoryId = parseInt(formData.get("categoryId") as string);
    const deleteImagesStr = formData.get("deleteImages") as string;
    
    console.log("📝 Update data received:", {
      name, description, price, categoryId
    });

    // Validation
    if (!name || !description || isNaN(price) || isNaN(categoryId)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if service exists
    const existingService = await findService(params.id);

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    console.log("✅ Service found:", existingService.id);

    await prisma.$connect();

    // Handle image deletions
    const imagesToDelete = deleteImagesStr ? JSON.parse(deleteImagesStr) : [];
    
    if (imagesToDelete.length > 0) {
      console.log("🗑️ Deleting images:", imagesToDelete);
      
      // Get images to delete for Cloudinary cleanup
      const imagesToDeleteData = await prisma.serviceImage.findMany({
        where: {
          id: { in: imagesToDelete },
          serviceId: existingService.id,
        },
      });

      // Delete from Cloudinary
      for (const image of imagesToDeleteData) {
        if (image.cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(image.cloudinaryPublicId);
            console.log(`✅ Deleted from Cloudinary: ${image.cloudinaryPublicId}`);
          } catch (error) {
            console.error(`❌ Failed to delete from Cloudinary: ${image.cloudinaryPublicId}`, error);
          }
        }
      }

      // Delete from database
      await prisma.serviceImage.deleteMany({
        where: {
          id: { in: imagesToDelete },
          serviceId: existingService.id,
        },
      });

      console.log("✅ Images deleted from database");
    }

    // Handle new image uploads
    const imageFiles = formData.getAll("images") as File[];
    console.log(`📷 Processing ${imageFiles.length} new images`);

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          console.log(`📤 Uploading new image: ${file.name}`);
          const uploadResult = await uploadToCloudinary(file);
          
          // Save to database
          await prisma.serviceImage.create({
            data: {
              url: uploadResult.secure_url,
              cloudinaryPublicId: uploadResult.public_id,
              serviceId: existingService.id,
            }
          });
          
          console.log(`✅ New image uploaded: ${uploadResult.secure_url}`);
        } catch (error) {
          console.error(`❌ Failed to upload image ${file.name}:`, error);
        }
      }
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: existingService.id },
      data: {
        name,
        description,
        price,
        categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            publicId: true,
            name: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            cloudinaryPublicId: true,
          },
        },
      },
    });

    console.log("✅ Service updated successfully");
    return NextResponse.json({
      success: true,
      data: updatedService,
      message: "Service updated successfully"
    });

  } catch (error: any) {
    console.error("Error updating service:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== Delete Service API Called ===", params.id);
    
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = await findService(params.id);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    console.log("✅ Service found:", service.id);

    await prisma.$connect();

    // Delete images from Cloudinary first
    for (const image of service.images) {
      if (image.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(image.cloudinaryPublicId);
          console.log(`✅ Deleted from Cloudinary: ${image.cloudinaryPublicId}`);
        } catch (error) {
          console.error(`❌ Failed to delete from Cloudinary: ${image.cloudinaryPublicId}`, error);
        }
      }
    }

    await prisma.service.delete({
      where: { id: service.id },
    });

    console.log("✅ Service deleted successfully");
    return NextResponse.json({ 
      success: true,
      message: "Service deleted successfully" 
    });

  } catch (error: any) {
    console.error("Error deleting service:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}