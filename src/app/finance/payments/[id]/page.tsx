// src/app/finance/payments/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Loader2,
  CreditCard,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface PaymentDetail {
  id: number;
  amount: number;
  method: string;
  status: string;
  paymentProof?: string;
  proofFileName?: string;
  notes?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: {
    name: string;
  };
  order: {
    id: number;
    orderNumber: string;
    totalAmount: number;
    status: string;
    shippingAddress?: string;
    user: {
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
        images: { url: string }[];
      };
      service?: {
        name: string;
        images: { url: string }[];
      };
    }>;
  };
}

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchPaymentDetail();
  }, [params.id]);

  const fetchPaymentDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/finance/payments/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setPayment(data);
      } else {
        toast.error("Payment tidak ditemukan");
        router.push("/finance/payments");
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
      toast.error("Gagal memuat data pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/finance/payments/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Status pembayaran berhasil diupdate");
        fetchPaymentDetail();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengupdate status");
      }
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast.error(error.message || "Gagal mengupdate status");
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/finance/payments/${params.id}/invoice`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${payment?.order.orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Invoice berhasil didownload");
      } else {
        throw new Error("Gagal generate invoice");
      }
    } catch (error: any) {
      console.error("Error downloading invoice:", error);
      toast.error(error.message || "Gagal download invoice");
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        icon: XCircle,
        label: "Menunggu",
      },
      PENDING_VERIFICATION: {
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
        icon: Upload,
        label: "Menunggu Verifikasi",
      },
      PAID: {
        color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        icon: CheckCircle,
        label: "Sudah Dibayar",
      },
      FAILED: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        icon: XCircle,
        label: "Gagal",
      },
      CANCELLED: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
        icon: XCircle,
        label: "Dibatalkan",
      },
    }[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: XCircle,
      label: status,
    };

    const Icon = statusConfig.icon;

    return (
      <span className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full ${statusConfig.color}`}>
        <Icon size={14} className="mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getMethodLabel = (method: string) => {
    const methods = {
      CASH: "Tunai",
      BANK_TRANSFER: "Transfer Bank",
      CREDIT_CARD: "Kartu Kredit",
      E_WALLET: "E-Wallet",
      COD: "Bayar di Tempat",
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Payment tidak ditemukan</h2>
        <Link
          href="/finance/payments"
          className="inline-flex items-center px-4 py-2 bg-primary-600 rounded-md text-white"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Daftar Pembayaran
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
            href="/finance/payments"
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detail Pembayaran</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Order #{payment.order.orderNumber}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={downloadInvoice}
            disabled={isDownloading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            Download Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Status Pembayaran</h2>
              {getStatusBadge(payment.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Jumlah</label>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  Rp {payment.amount.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Metode</label>
                <p className="font-medium">{getMethodLabel(payment.method)}</p>
              </div>
            </div>

            {(payment.status === "PENDING" || payment.status === "PENDING_VERIFICATION") && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updatePaymentStatus("PAID")}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating && <Loader2 size={16} className="mr-2 animate-spin" />}
                  <CheckCircle size={16} className="mr-2" />
                  Konfirmasi Pembayaran
                </button>
                <button
                  onClick={() => updatePaymentStatus("FAILED")}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating && <Loader2 size={16} className="mr-2 animate-spin" />}
                  <XCircle size={16} className="mr-2" />
                  Tolak Pembayaran
                </button>
              </div>
            )}
          </div>

          {payment.paymentProof && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText size={20} className="mr-2" />
                Bukti Pembayaran
              </h2>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">File:</span>
                  <span className="font-medium">{payment.proofFileName}</span>
                </div>
                <div className="flex justify-center">
                  <Image
                    src={payment.paymentProof}
                    alt="Bukti Pembayaran"
                    width={400}
                    height={300}
                    className="max-w-full h-auto rounded-md border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <a
                    href={payment.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Eye size={16} className="mr-2" />
                    Lihat Full Size
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Item Pesanan</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {payment.order.orderItems.map((item) => {
                const itemData = item.product || item.service;
                return (
                  <div key={item.id} className="p-6 flex items-center space-x-4">
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
                          <CreditCard size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{itemData?.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.product ? "Produk" : "Jasa"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>Qty: {item.quantity}</p>
                      <p className="font-medium">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary-600 dark:text-primary-400">
                  Rp {payment.order.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User size={20} className="mr-2" />
              Info Customer
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{payment.order.user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{payment.order.user.email}</p>
                {payment.order.user.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{payment.order.user.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar size={20} className="mr-2" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Payment Created</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(payment.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {payment.verifiedAt && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Payment Verified</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(payment.verifiedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {payment.verifiedBy && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Oleh: {payment.verifiedBy.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {payment.method === "BANK_TRANSFER" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Info Transfer</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bank:</span>
                  <span className="font-medium">BCA</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Rekening:</span>
                  <span className="font-medium">1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span>A/N:</span>
                  <span className="font-medium">CV Hutama</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
