// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log("🛡️ Middleware - Path:", pathname);
  
  // Periksa token otentikasi
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  console.log("🛡️ Middleware - Token:", { 
    exists: !!token, 
    role: token?.role, 
    id: token?.id 
  });
  
  // Jika user sudah login dan mengakses halaman login/register, redirect ke dashboard
  if ((pathname === "/login" || pathname === "/register") && token) {
    const role = token.role as string || "CUSTOMER";
    console.log("🔄 Redirect dari login ke dashboard:", role.toLowerCase());
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
  }
  
  // Redirect root dashboard ke dashboard spesifik berdasarkan role
  if (pathname === "/" && token) {
    const role = token.role as string || "CUSTOMER";
    console.log("🔄 Redirect root ke dashboard:", role.toLowerCase());
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
  }
  
  // Proteksi route admin - hanya ADMIN dan OWNER yang bisa akses
  if (pathname.startsWith("/admin") && (!token || !["ADMIN", "OWNER"].includes(token.role))) {
    console.log("❌ Unauthorized access to admin");
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Proteksi route owner - hanya OWNER yang bisa akses
  if (pathname.startsWith("/owner") && (!token || token.role !== "OWNER")) {
    console.log("❌ Unauthorized access to owner");
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Proteksi route finance - FINANCE, ADMIN, dan OWNER bisa akses
  if (pathname.startsWith("/finance") && (!token || !["FINANCE", "ADMIN", "OWNER"].includes(token.role))) {
    console.log("❌ Unauthorized access to finance");
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Proteksi route customer - hanya CUSTOMER yang bisa akses
  if (pathname.startsWith("/customer") && (!token || token.role !== "CUSTOMER")) {
    console.log("❌ Unauthorized access to customer");
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  console.log("✅ Access allowed");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register", 
    "/admin/:path*",
    "/owner/:path*", 
    "/finance/:path*",
    "/customer/:path*",
  ],
};