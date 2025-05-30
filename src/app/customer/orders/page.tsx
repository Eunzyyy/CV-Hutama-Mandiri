//src/app/customer/orders/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
  Plus,
  Loader2,
  RefreshCw,
  FileText,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

// ... interfaces tetap sama ...

export default function CustomerOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  
  // 🔥 SEPARATE INPUT DAN SEARCH QUERY
  const [searchInput, setSearchInput] = useState(""); // Yang user ketik
  const [searchQuery, setSearchQuery] = useState(""); // Yang dikirim ke API
  
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false); // Loading khusus search
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // 🔥 DEBOUNCE SEARCH - DELAY 500ms
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset ke halaman 1
      }
    }, 500); // 500ms delay

    return () => clearTimeout(debounceTimer);
  }, [searchInput, searchQuery]);

  // 🔥 FETCH ORDERS - HANYA KETIKA searchQuery BERUBAH
  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session, pagination.page, selectedStatus, searchQuery]); // searchQuery, bukan searchInput

  // 🔥 OPTIMIZED FETCH ORDERS
  const fetchOrders = useCallback(async () => {
    try {
      // Jika search, gunakan searching state, bukan loading
      if (searchQuery || selectedStatus) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (selectedStatus && selectedStatus.trim()) {
        params.set("status", selectedStatus);
      }
      
      if (searchQuery && searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const response = await fetch(`/api/customer/orders?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}`);
      }
      
      const data: OrdersResponse = await response.json();
      
      setOrders(data.orders || []);
      setPagination(prev => ({
        ...prev,
        ...data.pagination,
      }));
      
    } catch (error: any) {
      console.error("❌ Fetch orders error:", error);
      toast.error(`Gagal memuat pesanan: ${error.message}`);
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [pagination.page, selectedStatus, searchQuery, session]);

  const handleRefresh = () => {
    fetchOrders();
    toast.success("Data berhasil diperbarui");
  };

  // 🔥 CLEAR SEARCH
  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  // 🔥 HANDLE STATUS CHANGE
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPagination(prev => ({ ...prev, page: 1 }));
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
      <span className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full ${statusConfig.color}`}>
        <Icon size={14} className="mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  // 🔥 LOADING STATE YANG LEBIH SMART
  if (isLoading && !orders.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <ShoppingBag size={28} className="mr-3" />
            Pesanan Saya
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Pantau status dan riwayat pesanan Anda
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading || isSearching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/customer/products"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={20} className="mr-2" />
            Belanja Lagi
          </Link>
        </div>
      </div>

      {/* 🔥 IMPROVED SEARCH AND FILTER */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ketik nomor pesanan untuk mencari..."
                className="w-full py-2 pl-10 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              
              {/* Loading indicator saat searching */}
              {isSearching && (
                <Loader2 className="absolute right-3 top-2.5 text-blue-500 animate-spin" size={18} />
              )}
              
              {/* Clear button */}
              {searchInput && !isSearching && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {/* Search info */}
            {searchQuery && (
              <p className="text-xs text-gray-500 mt-1">
                Mencari "{searchQuery}" - {pagination.total} hasil ditemukan
              </p>
            )}
          </div>
          
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="PROCESSING">Diproses</option>
              <option value="SHIPPED">Dikirim</option>
              <option value="DELIVERED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        
        {/* Active filters */}
        {(searchQuery || selectedStatus) && (
          <div className="flex items-center space-x-2 mt-3">
            <span className="text-sm text-gray-500">Filter aktif:</span>
            {searchQuery && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                Search: "{searchQuery}"
                <button onClick={clearSearch} className="ml-1 hover:text-blue-900">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedStatus && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                Status: {selectedStatus}
                <button onClick={() => handleStatusChange("")} className="ml-1 hover:text-purple-900">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 🔥 ORDERS LIST - DENGAN SMOOTH LOADING */}
      <div className="relative">
        {/* Overlay loading untuk search */}
        {isSearching && orders.length > 0 && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 z-10 flex items-center justify-center rounded-lg">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow flex items-center">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Mencari...</span>
            </div>
          </div>
        )}

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">#{order.orderNumber}</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar size={16} className="mr-1" />
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long", 
                          year: "numeric"
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex -space-x-2">
                      {order.orderItems.slice(0, 3).map((item, index) => {
                        const itemData = item.product || item.service;
                        return (
                          <div key={index} className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-white dark:border-gray-800 overflow-hidden">
                            {itemData && item.product?.images?.[0] ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={itemData.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={20} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                      </p>
                      {order.orderItems.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{order.orderItems.length - 3} item lainnya
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Eye size={16} className="mr-2" />
                        Detail
                      </Link>
                      
                      {/* Download Invoice jika sudah DELIVERED */}
                      {order.status === "DELIVERED" && order.payments?.[0]?.status === "PAID" && (
                        <Link
                          href={`/api/finance/payments/${order.payments[0].id}/invoice`}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          target="_blank"
                        >
                          <FileText size={16} className="mr-2" />
                          Invoice
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchQuery || selectedStatus ? "Tidak ada pesanan" : "Belum Ada Pesanan"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || selectedStatus 
                ? "Tidak ada pesanan yang sesuai dengan pencarian atau filter"
                : "Anda belum memiliki pesanan. Mulai berbelanja sekarang!"
              }
            </p>
            <Link
              href="/customer/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} className="mr-2" />
              {searchQuery || selectedStatus ? "Buat Pesanan Baru" : "Buat Pesanan Pertama"}
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setPagination(prev => ({ ...prev, page }))}
              disabled={isSearching}
              className={`px-4 py-2 rounded-md disabled:opacity-50 ${
                page === pagination.page
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}