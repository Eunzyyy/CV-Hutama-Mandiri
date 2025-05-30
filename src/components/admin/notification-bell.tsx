"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session && ["ADMIN", "OWNER", "FINANCE"].includes(session.user.role)) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.isRead).length || 0);
      } else {
        console.error("Failed to fetch notifications:", response.status);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success("Notifikasi ditandai sudah dibaca");
      } else {
        toast.error("Gagal menandai notifikasi");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Gagal menandai notifikasi");
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("Semua notifikasi ditandai sudah dibaca");
      } else {
        toast.error("Gagal menandai semua notifikasi");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Gagal menandai semua notifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER_CREATED":
        return "🛍️";
      case "ORDER_UPDATED":
        return "📦";
      case "ORDER_CANCELLED":
        return "❌";
      case "ORDER_COMPLETED":
        return "✅";
      case "USER_REGISTERED":
        return "👤";
      case "REVIEW_ADDED":
        return "⭐";
      case "PAYMENT_RECEIVED":
        return "💰";
      case "PAYMENT_PENDING":
        return "⏳";
      case "SYSTEM_ALERT":
        return "🚨";
      default:
        return "🔔";
    }
  };

  const getNotificationRedirectUrl = (notification: Notification) => {
    switch (notification.type) {
      case "ORDER_CREATED":
      case "ORDER_UPDATED":
      case "ORDER_CANCELLED":
      case "ORDER_COMPLETED":
        return notification.data?.orderId ? `/admin/orders/${notification.data.orderId}` : "/admin/orders";
      case "USER_REGISTERED":
        return "/admin/users";
      case "PAYMENT_RECEIVED":
      case "PAYMENT_PENDING":
        return "/finance/payments";
      default:
        return "/admin";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    const redirectUrl = getNotificationRedirectUrl(notification);
    setIsOpen(false);
    window.location.href = redirectUrl;
  };

  // Don't render if user doesn't have permission
  if (!session || !["ADMIN", "OWNER", "FINANCE"].includes(session.user.role)) {
    return null;
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Notifikasi"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[32rem] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      disabled={isLoading}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 flex items-center"
                      title="Tandai semua sudah dibaca"
                    >
                      {isLoading ? (
                        <Loader2 size={12} className="animate-spin mr-1" />
                      ) : (
                        <Check size={12} className="mr-1" />
                      )}
                      Tandai semua
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Tutup"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                      !notification.isRead ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {new Date(notification.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-2 flex-shrink-0 p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              title="Tandai sudah dibaca"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Tidak ada notifikasi</p>
                  <p className="text-sm mt-1">Semua notifikasi akan muncul di sini</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full notifications page based on role
                    const notificationUrl = session.user.role === "OWNER" ? "/owner/notifications" : "/admin/notifications";
                    window.location.href = notificationUrl;
                  }}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Lihat Semua Notifikasi
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}