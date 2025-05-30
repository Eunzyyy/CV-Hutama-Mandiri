// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import cloudinary from "@/lib/cloudinary";

// Helper function untuk mencari produk berdasarkan publicId atau regular id
async function findProduct(identifier: string) {
  console.log('Finding product with identifier:', identifier);
  
  // Coba cari berdasarkan publicId dulu
  let product = await prisma.product.findUnique({
    where: { publicId: identifier },
    include: {
      category: {
        select: {
          id: true,
          publicId: true,
          name: true,
        },
      },
      images: { // ← ProductImage relation
        select: {
          id: true,
          url: true,
          cloudinaryPublicId: true,
        },
      },
    },
  });

  console.log('Product found by publicId:', product ? 'YES' : 'NO');

  // Jika tidak ketemu dan identifier adalah angka, coba cari berdasarkan id
  if (!product && !isNaN(Number(identifier))) {
    console.log('Trying to find by regular id:', identifier);
    product = await prisma.product.findUnique({
      where: { id: parseInt(identifier) },
      include: {
        category: {
          select: {
            id: true,
            publicId: true,
            name: true,
          },
        },
        images: { // ← ProductImage relation
          select: {
            id: true,
            url: true,
            cloudinaryPublicId: true,
          },
        },
      },
    });
    console.log('Product found by id:', product ? 'YES' : 'NO');
  }

  return product;
}

// GET method tetap sama
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET request for product ID:', params.id);
    
    const product = await findProduct(params.id);

    if (!product) {
      console.log('Product not found with identifier:', params.id);
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log('Product found, returning data');
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

// PUT - Update produk
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== Update Product API Called ===", params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    // Cek apakah produk ada
    const existingProduct = await findProduct(params.id);

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("✅ Product found:", existingProduct.id);

    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const categoryId = parseInt(formData.get("categoryId") as string);
    const sku = formData.get("sku") as string || null;
    const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : null;
    const weightUnit = formData.get("weightUnit") as string || "gram";

    console.log("📝 Update data received:", {
      name, description, price, stock, categoryId, sku, weight, weightUnit
    });

    // Validasi input
    if (!name || !description || isNaN(price) || isNaN(stock) || isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Data tidak lengkap atau tidak valid" },
        { status: 400 }
      );
    }

    await prisma.$connect();

    // Handle image deletion
    const deleteImagesStr = formData.get("deleteImages") as string;
    if (deleteImagesStr) {
      try {
        const deleteImageIds = JSON.parse(deleteImagesStr);
        console.log("🗑️ Deleting images:", deleteImageIds);
        
        // Get images to delete for Cloudinary cleanup
        const imagesToDelete = await prisma.productImage.findMany({
          where: {
            id: { in: deleteImageIds },
            productId: existingProduct.id,
          },
        });

        // Delete from Cloudinary
        for (const image of imagesToDelete) {
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
        await prisma.productImage.deleteMany({
          where: {
            id: { in: deleteImageIds },
            productId: existingProduct.id,
          },
        });

        console.log("✅ Images deleted from database");
      } catch (error) {
        console.error("❌ Error deleting images:", error);
      }
    }

    // Handle new images upload
    const newImages = formData.getAll("images") as File[];
    console.log(`📷 Processing ${newImages.length} new images`);
    
    for (const image of newImages) {
      if (image && image.size > 0) {
        try {
          console.log(`📤 Uploading new image: ${image.name}`);
          const uploadResult = await uploadToCloudinary(image);
          
          // Save to database
          await prisma.productImage.create({
            data: {
              url: uploadResult.secure_url,
              cloudinaryPublicId: uploadResult.public_id,
              productId: existingProduct.id,
            }
          });
          
          console.log(`✅ New image uploaded: ${uploadResult.secure_url}`);
        } catch (error) {
          console.error(`❌ Failed to upload image ${image.name}:`, error);
        }
      }
    }

    // Konversi weight ke gram jika perlu
    let weightInGrams = weight;
    if (weight && weightUnit) {
      switch (weightUnit) {
        case 'kg':
          weightInGrams = weight * 1000;
          break;
        case 'ton':
          weightInGrams = weight * 1000000;
          break;
        case 'gram':
        default:
          weightInGrams = weight;
      }
    }

    // Update produk menggunakan internal id
    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        sku,
        weight: weightInGrams,
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

    console.log("✅ Product updated successfully");
    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully"
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate produk" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE method - update untuk gunakan ProductImage
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("=== Delete Product API Called ===", params.id);
    
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    // Cek apakah produk ada
    const existingProduct = await findProduct(params.id);

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.$connect();

    // Delete images from Cloudinary first
    for (const image of existingProduct.images) {
      if (image.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(image.cloudinaryPublicId);
          console.log(`✅ Deleted from Cloudinary: ${image.cloudinaryPublicId}`);
        } catch (error) {
          console.error(`❌ Failed to delete from Cloudinary: ${image.cloudinaryPublicId}`, error);
        }
      }
    }

    // Hapus produk (gambar akan terhapus otomatis karena onDelete: Cascade)
    await prisma.product.delete({
      where: { id: existingProduct.id },
    });

    console.log("✅ Product deleted successfully");
    return NextResponse.json({ 
      success: true,
      message: "Produk berhasil dihapus" 
    });

  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}