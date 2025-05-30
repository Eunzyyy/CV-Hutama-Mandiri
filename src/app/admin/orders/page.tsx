// src/app/admin/orders/page.tsx - COMPLETE WITH DARK MODE
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye,
  Trash2,
  Loader2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface Payment {
  id: number;
  status: string;
  method: string;
  amount: number;
  createdAt: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    publicId: string;
    name: string;
    price: number;
    images: { url: string }[];
  };
  service?: {
    id: number;
    publicId: string;
    name: string;
    price: number;
    images: { url: string }[];
  };
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  orderItems: OrderItem[];
  payments?: Payment[];
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      setLastRefresh(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, selectedStatus, searchQuery]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(selectedStatus && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      } else {
        throw new Error(data.error || "Gagal memuat pesanan");
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || "Gagal memuat pesanan");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.loading("Memperbarui data...", { id: "refresh" });
    fetchOrders();
    toast.success("Data berhasil diperbarui", { id: "refresh" });
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Status pesanan berhasil diupdate");
        fetchOrders();
      } else {
        if (response.status === 400 && result.details) {
          toast.error(result.error);
          toast.error(result.details, { duration: 5000 });
        } else {
          throw new Error(result.error || "Gagal mengupdate status");
        }
      }
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error(error.message || "Gagal mengupdate status");
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelOrder = async (orderId: number) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Pesanan berhasil dibatalkan");
        fetchOrders();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Gagal membatalkan pesanan");
      }
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Gagal membatalkan pesanan");
    }
  };

  const getPaymentStatus = (order: Order) => {
    if (!order.payments || order.payments.length === 0) {
      return { status: "NO_PAYMENT", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", label: "Belum Ada Pembayaran" };
    }

    const latestPayment = order.payments[0];
    
    const statusConfig = {
      PAID: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Sudah Dibayar" },
      PENDING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "Menunggu Pembayaran" },
      PENDING_VERIFICATION: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400", label: "Menunggu Verifikasi" },
      FAILED: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Pembayaran Gagal" },
      CANCELLED: { color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", label: "Dibatalkan" },
    };

    return statusConfig[latestPayment.status as keyof typeof statusConfig] || 
           { status: latestPayment.status, color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", label: latestPayment.status };
  };

  const canProcessOrder = (order: Order) => {
    if (order.status !== "PENDING") return false;
    
    if (!order.payments || order.payments.length === 0) return false;
    
    const latestPayment = order.payments[0];
    return latestPayment.status === "PAID";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: Clock, label: "Menunggu" },
      PROCESSING: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Package, label: "Diproses" },
      SHIPPED: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: Truck, label: "Dikirim" },
      DELIVERED: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle, label: "Selesai" },
      CANCELLED: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: XCircle, label: "Dibatalkan" },
    }[status] || { color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", icon: Clock, label: status };

    const Icon = statusConfig.icon;

    return (
      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusConfig.color}`}>
        <Icon size={12} className="mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get("search") as string;
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pesanan</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola semua pesanan pelanggan
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Terakhir update: {new Date(lastRefresh).toLocaleTimeString('id-ID')}
          </span>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor pesanan, nama, atau email pelanggan..."
                className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
              <button
                type="submit"
                className="absolute right-3 top-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors"
              >
                Cari
              </button>
            </form>
          </div>

          <div className="lg:col-span-4">
            <div className="relative">
              <select
                value={selectedStatus || ""}
                onChange={(e) => {
                  setSelectedStatus(e.target.value || null);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">Semua Status</option>
                <option value="PENDING">Menunggu</option>
                <option value="PROCESSING">Diproses</option>
                <option value="SHIPPED">Dikirim</option>
                <option value="DELIVERED">Selesai</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
              <Filter className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pesanan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status Pesanan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status Pembayaran
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => {
                  const paymentInfo = getPaymentStatus(order);
                  const canProcess = canProcessOrder(order);
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.orderItems.length} item(s)
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${paymentInfo.color}`}>
                          <CreditCard size={12} className="mr-1" />
                          {paymentInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye size={18} />
                          </Link>
                          
                          {order.status === "PENDING" && (
                            <div className="relative group">
                              <button
                                onClick={() => canProcess ? updateOrderStatus(order.id, "PROCESSING") : null}
                                disabled={isUpdating || !canProcess}
                                className={`${
                                  canProcess 
                                    ? "text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" 
                                    : "text-gray-400 cursor-not-allowed dark:text-gray-600"
                                } disabled:opacity-50 transition-colors`}
                                title={canProcess ? "Proses Pesanan" : "Menunggu konfirmasi pembayaran"}
                              >
                                <Package size={18} />
                              </button>
                              
                              {!canProcess && (
                                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  <AlertTriangle size={12} className="inline mr-1" />
                                  Menunggu konfirmasi pembayaran
                                </div>
                              )}
                            </div>
                          )}
                          
                          {order.status === "PROCESSING" && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                              disabled={isUpdating}
                              className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50 transition-colors"
                              title="Kirim Pesanan"
                            >
                              <Truck size={18} />
                            </button>
                          )}
                          
                          {(order.status === "PENDING" || order.status === "PROCESSING") && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Batalkan Pesanan"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Tidak Ada Pesanan</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || selectedStatus
                ? "Tidak ada pesanan yang sesuai dengan filter"
                : "Belum ada pesanan masuk"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {orders.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pesanan
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">
              {pagination.page}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}