// src/app/owner/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Users,
  Filter,
  Search,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId?: number;
  userName?: string;
}

export default function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "SYSTEM_ALERT",
    targetUsers: "ALL"
  });

  useEffect(() => {
    fetchNotifications();
  }, [searchTerm, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (typeFilter !== "ALL") params.set("type", typeFilter);

      const response = await fetch(`/api/owner/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        throw new Error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Gagal memuat notifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  const createNotification = async () => {
    try {
      const response = await fetch('/api/owner/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification)
      });

      if (response.ok) {
        toast.success("Notification sent successfully");
        setShowCreateModal(false);
        setNewNotification({
          title: "",
          message: "",
          type: "SYSTEM_ALERT",
          targetUsers: "ALL"
        });
        fetchNotifications();
      } else {
        throw new Error("Failed to create notification");
      }
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  const deleteNotification = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const response = await fetch(`/api/owner/notifications/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Notification deleted");
        fetchNotifications();
      } else {
        throw new Error("Failed to delete notification");
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      ORDER_CREATED: { color: "bg-blue-100 text-blue-800", label: "Order" },
      PAYMENT_RECEIVED: { color: "bg-green-100 text-green-800", label: "Payment" },
      SYSTEM_ALERT: { color: "bg-red-100 text-red-800", label: "System" },
      USER_REGISTERED: { color: "bg-purple-100 text-purple-800", label: "User" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { color: "bg-gray-100 text-gray-800", label: type };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notification Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Send and manage system notifications
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Create Notification
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="ORDER_CREATED">Order</option>
            <option value="PAYMENT_RECEIVED">Payment</option>
            <option value="SYSTEM_ALERT">System Alert</option>
            <option value="USER_REGISTERED">User Registration</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeBadge(notification.type)}
                      <span className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleString("id-ID")}
                      </span>
                      {notification.userName && (
                        <span className="text-sm text-gray-500">• {notification.userName}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.isRead ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-blue-600" />
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Notification</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SYSTEM_ALERT">System Alert</option>
                  <option value="ORDER_CREATED">Order Update</option>
                  <option value="PAYMENT_RECEIVED">Payment Info</option>
                  <option value="USER_REGISTERED">User Info</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Users</label>
                <select
                  value={newNotification.targetUsers}
                  onChange={(e) => setNewNotification({...newNotification, targetUsers: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Users</option>
                  <option value="ADMIN">Admins Only</option>
                  <option value="CUSTOMER">Customers Only</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createNotification}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Send size={16} className="mr-2" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}