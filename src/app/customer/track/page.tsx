// src/app/customer/track/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  MapPin,
  Calendar,
  User,
  FileText,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";

interface OrderTracking {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  requestedDeliveryDate?: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: Array<{
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
  trackingHistory: Array<{
    status: string;
    description: string;
    createdAt: string;
  }>;
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams?.get('order') || '');
  const [orderData, setOrderData] = useState<OrderTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      handleTrackOrder();
    }
  }, []);

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      toast.error('Silakan masukkan nomor pesanan');
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    
    try {
      const response = await fetch(`/api/customer/orders/track?order=${encodeURIComponent(orderNumber)}`);
      const data = await response.json();

      if (response.ok) {
        setOrderData(data.order);
      } else if (response.status === 404) {
        setNotFound(true);
        setOrderData(null);
      } else {
        throw new Error(data.error || 'Gagal melacak pesanan');
      }
    } catch (error: any) {
      console.error('Error tracking order:', error);
      toast.error(error.message || 'Gagal melacak pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      PENDING: { 
        icon: Clock, 
        label: 'Menunggu Diproses', 
        color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
        description: 'Pesanan Anda sedang menunggu konfirmasi dan akan segera diproses'
      },
      PROCESSING: { 
        icon: Package, 
        label: 'Sedang Diproses', 
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
        description: 'Pesanan Anda sedang disiapkan oleh tim kami'
      },
      SHIPPED: { 
        icon: Truck, 
        label: 'Sedang Dikirim', 
        color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
        description: 'Pesanan Anda sedang dalam perjalanan ke alamat tujuan'
      },
      DELIVERED: { 
        icon: CheckCircle, 
        label: 'Pesanan Selesai', 
        color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        description: 'Pesanan telah berhasil diterima'
      },
      CANCELLED: { 
        icon: Clock, 
        label: 'Dibatalkan', 
        color: 'text-red-600 bg-red-100 dark:bg-red-900/20',
        description: 'Pesanan telah dibatalkan'
      }
    }[status] || { 
      icon: Clock, 
      label: status, 
      color: 'text-gray-600 bg-gray-100',
      description: 'Status tidak diketahui'
    };

    return statusConfig;
  };

  const getProgressPercentage = (status: string) => {
    const statusSteps = {
      PENDING: 25,
      PROCESSING: 50,
      SHIPPED: 75,
      DELIVERED: 100,
      CANCELLED: 0
    };
    return statusSteps[status as keyof typeof statusSteps] || 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Lacak Pesanan</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pantau status pesanan Anda secara real-time
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Nomor Pesanan
            </label>
            <div className="relative">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Masukkan nomor pesanan (contoh: ORD-1234567890-0001)"
                className="w-full py-3 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>
          <div className="sm:mt-7">
            <button
              onClick={handleTrackOrder}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search size={20} className="mr-2" />
                  Lacak Pesanan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Order Not Found */}
      {notFound && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Pesanan Tidak Ditemukan</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nomor pesanan "{orderNumber}" tidak ditemukan dalam sistem kami.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pastikan nomor pesanan yang Anda masukkan sudah benar, atau hubungi customer service untuk bantuan.
          </p>
        </div>
      )}

      {/* Order Details */}
      {orderData && (
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">#{orderData.orderNumber}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dibuat pada {new Date(orderData.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  Rp {orderData.totalAmount.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              {(() => {
                const statusInfo = getStatusInfo(orderData.status);
                const Icon = statusInfo.icon;
                return (
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${statusInfo.color}`}>
                    <Icon size={20} className="mr-2" />
                    <span className="font-medium">{statusInfo.label}</span>
                  </div>
                );
              })()}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm font-medium">{getProgressPercentage(orderData.status)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(orderData.status)}%` }}
                ></div>
              </div>
            </div>

            {/* Status Description */}
            <p className="text-gray-600 dark:text-gray-400">
              {getStatusInfo(orderData.status).description}
            </p>
          </div>

          {/* Order Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Riwayat Pesanan</h3>
            
            <div className="space-y-4">
              {/* Default timeline jika tidak ada tracking history */}
              {(!orderData.trackingHistory || orderData.trackingHistory.length === 0) ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      ['DELIVERED', 'SHIPPED', 'PROCESSING', 'PENDING'].includes(orderData.status) 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium">Pesanan Dibuat</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(orderData.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {orderData.status !== 'PENDING' && (
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        ['DELIVERED', 'SHIPPED', 'PROCESSING'].includes(orderData.status) 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Package size={16} />
                      </div>
                      <div>
                        <h4 className="font-medium">Pesanan Diproses</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pesanan sedang disiapkan
                        </p>
                      </div>
                    </div>
                  )}

                  {['DELIVERED', 'SHIPPED'].includes(orderData.status) && (
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        ['DELIVERED', 'SHIPPED'].includes(orderData.status) 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Truck size={16} />
                      </div>
                      <div>
                        <h4 className="font-medium">Pesanan Dikirim</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pesanan dalam perjalanan
                        </p>
                      </div>
                    </div>
                  )}

                  {orderData.status === 'DELIVERED' && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-green-100 text-green-600">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <h4 className="font-medium">Pesanan Selesai</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pesanan berhasil diterima
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Jika ada tracking history dari database
                orderData.trackingHistory.map((track, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-primary-100 text-primary-600">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium">{track.status}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {track.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(track.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shipping Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="mr-2" size={20} />
                Informasi Pengiriman
              </h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium flex items-center mb-1">
                    <User className="mr-2" size={16} />
                    Penerima
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{orderData.user.name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Alamat</h4>
                  <p className="text-gray-600 dark:text-gray-400">{orderData.shippingAddress}</p>
                </div>
                
                {orderData.requestedDeliveryDate && (
                  <div>
                    <h4 className="font-medium flex items-center mb-1">
                      <Calendar className="mr-2" size={16} />
                      Tanggal Permintaan
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(orderData.requestedDeliveryDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-1">Metode Pembayaran</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {orderData.paymentMethod === 'bank_transfer' ? 'Transfer Bank' :
                     orderData.paymentMethod === 'cash_on_delivery' ? 'Bayar di Tempat (COD)' :
                     orderData.paymentMethod === 'company_credit' ? 'Kredit Perusahaan' :
                     orderData.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="mr-2" size={20} />
                Item Pesanan
              </h3>
              
              <div className="space-y-3">
                {orderData.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.product?.name || item.service?.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.quantity}x - Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total:</span>
                  <span className="text-primary-600">
                    Rp {orderData.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {orderData.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Catatan Pesanan
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{orderData.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}