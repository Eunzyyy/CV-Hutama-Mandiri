// src/components/dashboard/layout.tsx - FIXED
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import NotificationHeader from "@/components/admin/notification-header";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };
  
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const userRole = session?.user?.role || "CUSTOMER";
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar userRole={userRole} /> {/* ✅ Hapus props yang tidak ada */}
      </div>
      
      {/* Mobile Sidebar */}
      {isMobile && mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
            onClick={toggleMobileSidebar}
          ></div>
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 h-full">
            <Sidebar userRole={userRole} /> {/* ✅ Hapus props yang tidak ada */}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-4 lg:hidden">
          <div className="flex items-center justify-between">
            <button 
              onClick={toggleMobileSidebar}
              className="text-gray-600 dark:text-gray-300 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
              CV Hutama Mandiri
            </h1>
            <div className="w-6"></div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      <NotificationHeader />
    </div>
  );
}