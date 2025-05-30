// src/components/admin/notification-floating.tsx (TANPA FRAMER MOTION)
"use client";

import { useState, useEffect } from "react";
import { Bell, MessageCircle, Package, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";

interface NotificationStats {
  total: number;
  orders: number;
  messages: number;
  products: number;
}

export default function NotificationFloating() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    orders: 0,
    messages: 0,
    products: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (session) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/notifications/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  };

  if (!session || !["ADMIN", "OWNER", "FINANCE"].includes(session.user.role)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Stats Cards */}
      {isExpanded && (
        <div className="mb-4 space-y-3 transition-all duration-300">
          {stats.orders > 0 && (
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => window.location.href = "/admin/orders"}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <ShoppingCart size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pesanan Baru</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.orders}</p>
                </div>
              </div>
            </div>
          )}

          {stats.messages > 0 && (
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => window.location.href = "/admin/reviews"}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <MessageCircle size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pesan Baru</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.messages}</p>
                </div>
              </div>
            </div>
          )}

          {stats.products > 0 && (
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => window.location.href = "/admin/products"}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Package size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Produk Alert</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.products}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110 ${
          isExpanded ? 'rotate-45' : ''
        }`}
      >
        <Bell size={24} />
        {stats.total > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
            {stats.total > 99 ? "99+" : stats.total}
          </span>
        )}
      </button>
    </div>
  );
}