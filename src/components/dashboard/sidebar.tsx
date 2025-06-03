//src/components/dashboard/sidebar.tsx - UPDATE DENGAN CHAT
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/admin/notification-bell";
import {
  LayoutDashboard,
  Package,
  Wrench,
  ShoppingCart,
  Users,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  UserCog,
  ChevronLeft,
  Menu,
  ChevronDown,
  ChevronRight,
  Plus,
  Tags,
  UserCheck,
  BarChart3,
  FileText,
  Activity,
  Bell,
  Database,
  Shield,
  MessageCircle
} from "lucide-react";

interface SidebarProps {
  userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = (menuKey: string) => {
    if (collapsed) return;
    
    setExpandedMenus(prev => 
      prev.includes(menuKey) 
        ? prev.filter(key => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  const isMenuExpanded = (menuKey: string) => {
    return expandedMenus.includes(menuKey);
  };
  
  const getMenuItems = () => {
    switch (userRole) {
      case "ADMIN":
        return [
          { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
          { 
            name: "Produk", 
            href: "/admin/products", 
            icon: Package,
            expandable: true,
            key: "products",
            subItems: [
              { name: "Semua Produk", href: "/admin/products" },
              { name: "Tambah Produk", href: "/admin/products/create", icon: Plus },
              { name: "Kategori Produk", href: "/admin/categories/products", icon: Tags },
              { name: "Tambah Kategori Produk", href: "/admin/categories/products/create", icon: Plus }
            ]
          },
          { 
            name: "Jasa", 
            href: "/admin/services", 
            icon: Wrench,
            expandable: true,
            key: "services",
            subItems: [
              { name: "Semua Jasa", href: "/admin/services" },
              { name: "Tambah Jasa", href: "/admin/services/create", icon: Plus },
              { name: "Kategori Jasa", href: "/admin/categories/services", icon: Tags },
              { name: "Tambah Kategori Jasa", href: "/admin/categories/services/create", icon: Plus }
            ]
          },
          { 
            name: "Pesanan", 
            href: "/admin/orders", 
            icon: ShoppingCart,
            expandable: true,
            key: "orders",
            subItems: [
              { name: "Semua Pesanan", href: "/admin/orders" },
              { name: "Tambah Pesanan", href: "/admin/orders/create", icon: Plus }
            ]
          },
          { name: "Pengguna", href: "/admin/users", icon: UserCog },
          { name: "Chat", href: "/admin/chat", icon: MessageCircle }, // ✅ TAMBAH CHAT
          { name: "Profil", href: "/admin/profile", icon: User },
          { name: "Pengaturan", href: "/admin/settings", icon: Settings },
        ];
      case "OWNER":
        return [
          { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
          { name: "Analytics", href: "/owner/analytics", icon: BarChart3 },
          { name: "User Management", href: "/owner/users", icon: Users },
          { name: "Reports", href: "/owner/reports", icon: FileText },
          { name: "System Logs", href: "/owner/logs", icon: Activity },
          { name: "Notifications", href: "/owner/notifications", icon: Bell },
          { name: "Settings", href: "/owner/settings", icon: Settings },
        ];
      case "FINANCE":
        return [
          { name: "Dashboard", href: "/finance", icon: LayoutDashboard },
          { name: "Pembayaran", href: "/finance/payments", icon: Package },
          { name: "Laporan", href: "/finance/reports", icon: ShoppingCart },
          { name: "Chat", href: "/finance/chat", icon: MessageCircle }, // ✅ TAMBAH CHAT
          { name: "Profil", href: "/finance/profile", icon: User },
          { name: "Pengaturan", href: "/finance/settings", icon: Settings },
        ];
      case "CUSTOMER":
        return [
          { name: "Dashboard", href: "/customer", icon: LayoutDashboard },
          { 
            name: "Produk", 
            href: "/customer/products", 
            icon: Package,
            expandable: true,
            key: "products",
            subItems: [
              { name: "Semua Produk", href: "/customer/products" },
              { name: "Kategori Produk", href: "/customer/products/categories", icon: Tags }
            ]
          },
          { 
            name: "Jasa", 
            href: "/customer/services", 
            icon: Wrench,
            expandable: true,
            key: "services", 
            subItems: [
              { name: "Semua Jasa", href: "/customer/services" },
              { name: "Kategori Jasa", href: "/customer/services/categories", icon: Tags }
            ]
          },
          { name: "Pesanan", href: "/customer/orders", icon: ShoppingCart },
          { name: "Chat", href: "/customer/chat", icon: MessageCircle }, // ✅ TAMBAH CHAT
          { name: "Profil", href: "/customer/profile", icon: User },
          { name: "Pengaturan", href: "/customer/settings", icon: Settings },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const roleTitle = {
    "ADMIN": "Panel Admin",
    "OWNER": "Panel Owner", 
    "FINANCE": "Panel Finance",
    "CUSTOMER": "Area Customer"
  }[userRole] || "";

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        {!collapsed && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              CV Hutama
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {roleTitle}
            </p>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
      
      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            const hasSubItems = item.expandable && item.subItems && item.subItems.length > 0;
            const isExpanded = hasSubItems && isMenuExpanded(item.key || '');
            
            return (
              <li key={item.name}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={`flex items-center ${collapsed ? 'justify-center w-full' : 'px-3 flex-1'} py-2 rounded-md transition ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title={collapsed ? item.name : ""}
                  >
                    <Icon size={18} className={collapsed ? "" : "mr-3"} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                  
                  {!collapsed && hasSubItems && (
                    <button
                      onClick={() => toggleMenu(item.key || '')}
                      className="p-1 ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title={isExpanded ? "Tutup" : "Buka"}
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  )}
                </div>
                
                {!collapsed && hasSubItems && isExpanded && (
                  <ul className="mt-1 ml-6 space-y-1">
                    {item.subItems?.map((subItem, index) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href;
                      
                      return (
                        <li key={index}>
                          <Link
                            href={subItem.href}
                            className={`flex items-center px-3 py-1 text-sm rounded-md transition ${
                              isSubActive
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            {SubIcon && <SubIcon size={14} className="mr-2" />}
                            {subItem.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`flex items-center ${collapsed ? 'justify-center' : 'w-full px-3'} py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700`}
            title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : ""}
          >
            {theme === "dark" ? (
              <>
                <Sun size={18} className={collapsed ? "" : "mr-3"} />
                {!collapsed && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon size={18} className={collapsed ? "" : "mr-3"} />
                {!collapsed && <span>Dark Mode</span>}
              </>
            )}
          </button>
        )}
        
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center ${collapsed ? 'justify-center' : 'w-full px-3'} py-2 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20`}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut size={18} className={collapsed ? "" : "mr-3"} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}