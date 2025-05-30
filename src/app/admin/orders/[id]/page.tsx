// src/app/admin/orders/[id]/page.tsx - FIXED DARK MODE
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Loader2, 
  Package,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Eye
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  orderItems: Array<{
    id: number;
    quantity: number;
    price: number;
    product?: {
      name: string;
      images: Array<{ url: string }>;
    };
    service?: {
      name: string;
      images: Array<{ url: string }>;
    };
  }>;
  payments?: Array<{
    id: number;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    paymentProof?: string;
    notes?: string;
  }>;
}

export default function ViewOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        setLastRefresh(Date.now());
      } else {
        toast.error("Pesanan tidak ditemukan");
        router.push("/admin/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Gagal memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    const interval = setInterval(() => {
      fetchOrder();
    }, 15000);

    return () => clearInterval(interval);
  }, [params.id]);

  const handleRefresh = () => {
    toast.loading("Memperbarui data...", { id: "refresh" });
    fetchOrder();
    toast.success("Data berhasil diperbarui", { id: "refresh" });
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Status pesanan berhasil diupdate");
        fetchOrder();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ FIXED: Only get the LATEST payment (no duplicates)
  const getPaymentStatus = () => {
    if (!order?.payments || order.payments.length === 0) {
      return { 
        canProcess: false, 
        message: "Belum ada pembayaran",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400"
      };
    }

    // ✅ Get only the LATEST payment
    const latestPayment = order.payments[0];
    
    if (latestPayment.status === "PAID") {
      return { 
        canProcess: true, 
        message: "Pembayaran dikonfirmasi",
        color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      };
    }

    return { 
      canProcess: false, 
      message: "Menunggu konfirmasi pembayaran",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    };
  };

  if (isLoading && !order) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Pesanan tidak ditemukan</h2>
        <Link
          href="/admin/orders"
          className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  const paymentInfo = getPaymentStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/orders"
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Pesanan</h1>
            <p className="text-gray-500 dark:text-gray-400">#{order.orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Update: {new Date(lastRefresh).toLocaleTimeString('id-ID')}
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status Pesanan</h2>
              <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                <Clock size={14} className="mr-1" />
                {order.status}
              </span>
            </div>

            {/* Payment Warning */}
            {order.status === "PENDING" && !paymentInfo.canProcess && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-yellow-800 dark:text-yellow-200 font-medium">
                      Pesanan Belum Dapat Diproses
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                      {paymentInfo.message}. Pesanan hanya dapat diproses setelah pembayaran dikonfirmasi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {order.status === "PENDING" && (
                <button
                  onClick={() => updateOrderStatus("PROCESSING")}
                  disabled={isUpdating || !paymentInfo.canProcess}
                  className={`px-4 py-2 rounded-md flex items-center transition ${
                    paymentInfo.canProcess 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                  } disabled:opacity-50`}
                >
                  {isUpdating && <Loader2 size={16} className="mr-2 animate-spin" />}
                  <Package size={16} className="mr-2" />
                  Proses Pesanan
                </button>
              )}
              
              {order.status === "PROCESSING" && (
                <button
                  onClick={() => updateOrderStatus("SHIPPED")}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating && <Loader2 size={16} className="mr-2 animate-spin" />}
                  <Truck size={16} className="mr-2" />
                  Kirim Pesanan
                </button>
              )}
              
              {order.status === "SHIPPED" && (
                <button
                  onClick={() => updateOrderStatus("DELIVERED")}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating && <Loader2 size={16} className="mr-2 animate-spin" />}
                  <CheckCircle size={16} className="mr-2" />
                  Selesaikan Pesanan
                </button>
              )}
              
              {["PENDING", "PROCESSING"].includes(order.status) && (
                <button
                  onClick={() => updateOrderStatus("CANCELLED")}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating && <Loader2 size={16} className="mr-2 animate-spin" />}
                  <XCircle size={16} className="mr-2" />
                  Batalkan Pesanan
                </button>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
                <CreditCard size={20} className="mr-2" />
                Status Pembayaran
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentInfo.color}`}>
                {paymentInfo.message}
              </span>
            </div>
            
            {order.payments && order.payments.length > 0 ? (
              <div className="space-y-4">
                {/* ✅ SHOW ONLY LATEST PAYMENT */}
                {order.payments.slice(0, 1).map((payment, index) => (
                  <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Payment #{index + 1}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'PAID' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : payment.status === 'PENDING_VERIFICATION'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Jumlah:</span>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Metode:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{payment.method}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm mb-3">
                      <span className="text-gray-500 dark:text-gray-400">Tanggal:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(payment.createdAt)}</p>
                    </div>

                    {payment.paymentProof && (
                      <div className="mb-3">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Bukti Pembayaran:</span>
                        <div className="mt-2">
                          <Image
                            src={payment.paymentProof}
                            alt="Bukti Pembayaran"
                            width={200}
                            height={150}
                            className="rounded border border-gray-200 dark:border-gray-700 object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    {payment.notes && (
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Catatan:</span>
                        <p className="text-gray-700 dark:text-gray-300">{payment.notes}</p>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                      <Link
                        href={`/finance/payments/${payment.id}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Lihat Detail Pembayaran →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada pembayaran</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Item Pesanan ({order.orderItems.length})</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.orderItems.map((item) => {
                const itemData = item.product || item.service;
                
                return (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                        {itemData?.images?.[0] ? (
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
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">
                              {itemData?.name}
                            </h3>
                            <div className="mt-1">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                {item.product ? 'Produk' : 'Jasa'}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>Qty: {item.quantity} × {formatCurrency(item.price)}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(item.quantity * item.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">Total Pesanan:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <User size={20} className="mr-2 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Info Pelanggan</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{order.user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{order.user.email}</p>
                {order.user.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{order.user.phone}</p>
                )}
              </div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Alamat Pengiriman</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                <p className="text-gray-700 dark:text-gray-300">{order.shippingAddress}</p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Pesanan Dibuat</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Terakhir Diupdate</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}