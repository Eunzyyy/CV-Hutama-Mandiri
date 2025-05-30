// src/app/admin/orders/view/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Package, 
  User, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
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
}

export default function ViewOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Pesanan tidak ditemukan");
        }
        throw new Error("Gagal memuat pesanan");
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      toast.error(error.message || "Gagal memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${status}?`)) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success("Status pesanan berhasil diupdate");
        fetchOrder();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengupdate status");
      }
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error(error.message || "Gagal mengupdate status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: Clock, label: "Menunggu" },
      PROCESSING: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Package, label: "Diproses" },
      SHIPPED: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", icon: Truck, label: "Dikirim" },
      DELIVERED: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle, label: "Selesai" },
      CANCELLED: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: XCircle, label: "Dibatalkan" },
    }[status] || { color: "bg-gray-100 text-gray-800", icon: Clock, label: status };

    const Icon = statusConfig.icon;

    return (
      <span className={`px-3 py-1 inline-flex items-center text-sm leading-5 font-semibold rounded-full ${statusConfig.color}`}>
        <Icon size={14} className="mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Pesanan tidak ditemukan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Pesanan dengan ID "{params.id}" tidak ditemukan atau telah dihapus.
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center px-4 py-2 bg-primary-600 rounded-md text-white hover:bg-primary-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/orders"
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detail Pesanan</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Pesanan #{order.orderNumber}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/admin/orders/edit/${order.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Status Pesanan</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status Saat Ini:</span>
                {getStatusBadge(order.status)}
              </div>
              
              {/* Quick Status Actions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubah Status:</p>
                <div className="grid grid-cols-1 gap-2">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => updateOrderStatus("PROCESSING")}
                      disabled={isUpdating}
                      className="flex items-center justify-center py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      <Package size={14} className="mr-1" />
                      Proses Pesanan
                    </button>
                  )}
                  
                  {order.status === "PROCESSING" && (
                    <button
                      onClick={() => updateOrderStatus("SHIPPED")}
                      disabled={isUpdating}
                      className="flex items-center justify-center py-2 px-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
                    >
                      <Truck size={14} className="mr-1" />
                      Kirim Pesanan
                    </button>
                  )}
                  
                  {order.status === "SHIPPED" && (
                    <button
                      onClick={() => updateOrderStatus("DELIVERED")}
                      disabled={isUpdating}
                      className="flex items-center justify-center py-2 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Selesaikan
                    </button>
                  )}
                  
                  {["PENDING", "PROCESSING"].includes(order.status) && (
                    <button
                      onClick={() => updateOrderStatus("CANCELLED")}
                      disabled={isUpdating}
                      className="flex items-center justify-center py-2 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      <XCircle size={14} className="mr-1" />
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Customer</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <User size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {order.user.id}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail size={16} className="text-gray-400 mr-3" />
                <p className="text-sm">{order.user.email}</p>
              </div>
              
              {order.user.phone && (
                <div className="flex items-center">
                  <Phone size={16} className="text-gray-400 mr-3" />
                  <p className="text-sm">{order.user.phone}</p>
                </div>
              )}
              
              {(order.user.address || order.shippingAddress) && (
                <div className="flex items-start">
                  <MapPin size={16} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Alamat Pengiriman:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress || order.user.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Item Pesanan ({order.orderItems.length})</h3>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.orderItems.map((item) => {
                const isProduct = !!item.product;
                const itemData = isProduct ? item.product : item.service;
                
                return (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Item Image */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                        {itemData?.images[0] ? (
                          <Image
                            src={itemData.images[0].url}
                            alt={itemData.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {itemData?.name}
                            </h4>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                isProduct 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              }`}>
                                {isProduct ? 'Produk' : 'Jasa'}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Rp {item.price.toLocaleString("id-ID")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              per item
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <Link
                            href={`/admin/${isProduct ? 'products' : 'services'}/view/${itemData?.publicId}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Lihat Detail {isProduct ? 'Produk' : 'Jasa'}
                          </Link>
                          
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Subtotal: Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Order Total */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total Pesanan:</span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  Rp {order.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Order Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Pesanan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Pesanan</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Terakhir Update</p>
                  <p className="font-medium">
                    {new Date(order.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Catatan:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}