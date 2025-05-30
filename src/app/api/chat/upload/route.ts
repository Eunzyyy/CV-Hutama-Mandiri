// src/app/api/chat/upload/route.ts - FILE UPLOAD API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validasi file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "auto", // auto-detect file type
          folder: "chat-attachments",
          public_id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    }) as any;

    // Determine file type
    const getFileType = (mimeType: string) => {
      if (mimeType.startsWith('image/')) return 'IMAGE';
      if (mimeType.startsWith('video/')) return 'VIDEO';
      if (mimeType.startsWith('audio/')) return 'AUDIO';
      if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'DOCUMENT';
      return 'OTHER';
    };

    const attachmentData = {
      fileName: uploadResult.public_id,
      originalName: file.name,
      fileUrl: uploadResult.secure_url,
      fileType: getFileType(file.type),
      fileSize: file.size,
      mimeType: file.type,
      cloudinaryId: uploadResult.public_id,
    };

    return NextResponse.json({
      success: true,
      attachment: attachmentData
    });

  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return NextResponse.json({ 
      error: "Upload failed", 
      debug: error.message 
    }, { status: 500 });
  }
}