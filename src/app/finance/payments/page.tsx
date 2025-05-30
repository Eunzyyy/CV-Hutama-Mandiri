// src/app/finance/payments/page.tsx - FIXED STATUS MAPPING
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  User,
  Building,
  ArrowUpDown,
  Upload
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  order: {
    orderNumber: string;
    user: {
      name: string;
      email: string;
    };
  };
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  failedCount: number;
}

export default function FinancePaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, [searchTerm, statusFilter, methodFilter, currentPage]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10"
      });

      if (searchTerm) params.set("search", searchTerm);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (methodFilter !== "ALL") params.set("method", methodFilter);

      const response = await fetch(`/api/finance/payments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Gagal memuat data pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: number, newStatus: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus === 'PAID' ? 'Sudah Dibayar' : 'Gagal'}?`)) return;

    try {
      const response = await fetch(`/api/finance/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Status pembayaran berhasil diperbarui");
        fetchPayments();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update payment status");
      }
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast.error(error.message || "Gagal memperbarui status pembayaran");
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  // FIXED: Konsisten dengan payment detail page
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", 
        icon: Clock, 
        label: "Menunggu" 
      },
      PENDING_VERIFICATION: { 
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400", 
        icon: Upload, 
        label: "Menunggu Verifikasi" 
      },
      PAID: { 
        color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", 
        icon: CheckCircle, 
        label: "Sudah Dibayar" 
      },
      FAILED: { 
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", 
        icon: XCircle, 
        label: "Gagal" 
      },
      CANCELLED: { 
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", 
        icon: XCircle, 
        label: "Dibatalkan" 
      },
      REFUNDED: { 
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", 
        icon: ArrowUpDown, 
        label: "Dikembalikan" 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      icon: Clock,
      label: status
    };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      CASH: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", label: "Tunai" },
      BANK_TRANSFER: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", label: "Transfer Bank" },
      CREDIT_CARD: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", label: "Kartu Kredit" },
      E_WALLET: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "E-Wallet" },
      COD: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400", label: "Bayar di Tempat" },
    };

    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.CASH;

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
          <h1 className="text-2xl font-bold">Manajemen Pembayaran</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola dan pantau semua transaksi pembayaran
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pembayaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
            <option value="PAID">Sudah Dibayar</option>
            <option value="FAILED">Gagal</option>
            <option value="CANCELLED">Dibatalkan</option>
            <option value="REFUNDED">Dikembalikan</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="ALL">Semua Metode</option>
            <option value="CASH">Tunai</option>
            <option value="BANK_TRANSFER">Transfer Bank</option>
            <option value="CREDIT_CARD">Kartu Kredit</option>
            <option value="E_WALLET">E-Wallet</option>
            <option value="COD">Bayar di Tempat</option>
          </select>

          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            Total: {payments.length} pembayaran
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{payment.order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.order.user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.order.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMethodBadge(payment.method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Link
                            href={`/finance/payments/${payment.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </Link>
                          {(payment.status === "PENDING" || payment.status === "PENDING_VERIFICATION") && (
                            <>
                              <button
                                onClick={() => updatePaymentStatus(payment.id, "PAID")}
                                className="text-green-600 hover:text-green-900"
                                title="Konfirmasi Pembayaran"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(payment.id, "FAILED")}
                                className="text-red-600 hover:text-red-900"
                                title="Tolak Pembayaran"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {payments.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            Tidak ada data pembayaran yang ditemukan
          </div>
        </div>
      )}
    </div>
  );
}