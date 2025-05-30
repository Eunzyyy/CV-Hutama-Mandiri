// src/app/admin/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  ShoppingCart, 
  MessageSquare, 
  User, 
  AlertTriangle,
  Loader2,
  Search,
  Filter
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  user?: {
    name: string;
  };
}

export default function AdminNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<string>("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, filterType, showUnreadOnly]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filterType && { type: filterType }),
        ...(showUnreadOnly && { unread: "true" }),
      });

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setPagination(data.pagination);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Gagal memuat notifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        toast.success("Semua notifikasi telah dibaca");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Gagal mengupdate notifikasi");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER_CREATED":
      case "ORDER_UPDATED":
      case "ORDER_CANCELLED":
        return <ShoppingCart size={20} className="text-blue-500" />;
      case "REVIEW_ADDED":
        return <MessageSquare size={20} className="text-green-500" />;
      case "USER_REGISTERED":
        return <User size={20} className="text-purple-500" />;
      case "SYSTEM_ALERT":
        return <AlertTriangle size={20} className="text-red-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      ORDER_CREATED: "Pesanan Baru",
      ORDER_UPDATED: "Update Pesanan",
      ORDER_CANCELLED: "Pesanan Dibatalkan",
      REVIEW_ADDED: "Ulasan Baru",
      USER_REGISTERED: "User Baru",
      SYSTEM_ALERT: "Alert Sistem",
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notifikasi</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi telah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <CheckCheck size={16} className="mr-2" />
            Baca Semua
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter Tipe
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Semua Tipe</option>
              <option value="ORDER_CREATED">Pesanan Baru</option>
              <option value="ORDER_UPDATED">Update Pesanan</option>
              <option value="ORDER_CANCELLED">Pesanan Dibatalkan</option>
              <option value="REVIEW_ADDED">Ulasan Baru</option>
              <option value="USER_REGISTERED">User Baru</option>
              <option value="SYSTEM_ALERT">Alert Sistem</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => {
                  setShowUnreadOnly(e.target.checked);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Hanya yang belum dibaca
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  !notification.isRead ? "bg-blue-50 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {getTypeLabel(notification.type)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center"
                          >
                            <Check size={14} className="mr-1" />
                            Tandai Dibaca
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {notification.message}
                    </p>
                    
                    {/* Additional Data */}
                    {notification.data && (
                      <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <div className="text-sm space-y-1">
                          {notification.data.orderNumber && (
                            <p><strong>Nomor Pesanan:</strong> {notification.data.orderNumber}</p>
                          )}
                          {notification.data.customerName && (
                            <p><strong>Customer:</strong> {notification.data.customerName}</p>
                          )}
                          {notification.data.totalAmount && (
                            <p><strong>Total:</strong> Rp {notification.data.totalAmount.toLocaleString("id-ID")}</p>
                          )}
                          {notification.data.itemCount && (
                            <p><strong>Jumlah Item:</strong> {notification.data.itemCount}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Tidak Ada Notifikasi</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {showUnreadOnly || filterType
                ? "Tidak ada notifikasi yang sesuai dengan filter"
                : "Belum ada notifikasi"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {notifications.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} notifikasi
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-2 text-sm bg-primary-600 text-white rounded-md">
              {pagination.page}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}