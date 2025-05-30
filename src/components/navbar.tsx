// src/components/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession(); // Tambahkan status
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // HIDE NAVBAR di halaman dashboard
  const isDashboard = pathname.includes('/admin') || 
                     pathname.includes('/owner') || 
                     pathname.includes('/finance') || 
                     pathname.includes('/customer');
  
  // Jika di dashboard atau belum mounted, jangan tampilkan navbar
  if (isDashboard || !mounted) {
    return null;
  }

  // Dynamic nav items berdasarkan user role
  const getNavItems = () => {
    const baseItems = [
      { name: "Beranda", href: "/" }
    ];

    // Debug log untuk melihat session
    console.log("🔍 Debug Navbar:", { 
      session: session, 
      role: session?.user?.role, 
      status: status 
    });

    // TEMPORARY FIX: Jika ada session apapun rolenya, paksa customer routes
    if (session) {
      console.log("✅ Session detected, forcing customer routes");
      return [
        ...baseItems,
        { name: "Produk", href: "/customer/products" },
        { name: "Jasa", href: "/customer/services" },
        { name: "Tentang Kami", href: "/about" },
        { name: "Kontak", href: "/contact" },
      ];
    }

    console.log("⚠️ No session, using public routes");
    // Default untuk user belum login
    return [
      ...baseItems,
      { name: "Produk", href: "/products" },
      { name: "Jasa", href: "/services" },
      { name: "Tentang Kami", href: "/about" },
      { name: "Kontak", href: "/contact" },
    ];
  };

  const navItems = getNavItems();

  // Handle logout dengan toast notification
  const handleLogout = async () => {
    try {
      toast.loading("Logout...");
      
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
      
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Terjadi kesalahan saat logout");
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                CV Hutama Mandiri
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? "border-blue-500 text-gray-900 dark:text-gray-100"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>

            {session ? (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Halo, {session.user?.name}
                </span>
                <Link
                  href={`/${session.user?.role?.toLowerCase()}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === item.href
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
              </button>

              {session ? (
                <>
                  <div className="pl-3 pr-4 py-2 text-base font-medium text-gray-600 dark:text-gray-400">
                    Halo, {session.user?.name}
                  </div>
                  <Link
                    href={`/${session.user?.role?.toLowerCase()}`}
                    className="block pl-3 pr-4 py-2 text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-3 pt-2">
                  <Link
                    href="/login"
                    className="w-full py-2 text-center rounded-md border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="w-full py-2 text-center rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}