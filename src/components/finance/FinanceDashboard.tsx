// src/app/finance/components/FinanceDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Calendar,
  FileText,
  Download,
  BarChart3,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import FinanceChart from "@/components/finance/finance-chart";
import RevenueChart from "@/components/finance/revenue-chart";
import OrderStatusChart from "@/components/finance/order-status-chart";

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface RecentTransaction {
  id: number;
  orderNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  customerName: string;
}

export default function FinanceDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");

  useEffect(() => {
    // Generate dummy data untuk demo
    const generateDummyData = () => {
      const dummyStats: FinanceStats = {
        totalRevenue: 125000000,
        monthlyRevenue: 25000000,
        totalOrders: 342,
        monthlyOrders: 67,
        averageOrderValue: 365000,
        pendingOrders: 12,
        completedOrders: 298,
        cancelledOrders: 32,
        revenueGrowth: 12.5,
        orderGrowth: 8.3
      };

      const dummyTransactions: RecentTransaction[] = [
        {
          id: 1,
          orderNumber: "ORD-2024-001",
          amount: 2500000,
          status: "DELIVERED",
          createdAt: new Date().toISOString(),
          customerName: "PT. ABC Industries"
        },
        {
          id: 2,
          orderNumber: "ORD-2024-002",
          amount: 1800000,
          status: "PROCESSING",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          customerName: "CV. XYZ Manufacturing"
        },
        {
          id: 3,
          orderNumber: "ORD-2024-003",
          amount: 3200000,
          status: "PENDING",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          customerName: "PT. Manufacturing Corp"
        }
      ];

      setTimeout(() => {
        setStats(dummyStats);
        setRecentTransactions(dummyTransactions);
        setIsLoading(false);
      }, 1000);
    };

    generateDummyData();
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      case "PROCESSING":
        return (
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
            Processing
          </span>
        );
      case "DELIVERED":
        return (
          <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const exportFinanceReport = async () => {
    try {
      toast.success("Laporan berhasil diunduh");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Gagal mengunduh laporan");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Keuangan</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selamat datang, {session?.user?.name}! Pantau performa keuangan dan transaksi perusahaan
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">7 Hari Terakhir</option>
            <option value="month">Bulan Ini</option>
            <option value="quarter">Kuartal Ini</option>
            <option value="year">Tahun Ini</option>
          </select>
          
          <button
            onClick={exportFinanceReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export Laporan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-4">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  {stats.revenueGrowth >= 0 ? (
                    <TrendingUp size={16} className="text-green-500 mr-1" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Revenue Periode Ini
                </p>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stats.monthlyOrders} pesanan
                </p>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-4">
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Pesanan
                </p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <div className="flex items-center mt-1">
                  {stats.orderGrowth >= 0 ? (
                    <TrendingUp size={16} className="text-green-500 mr-1" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stats.orderGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.orderGrowth >= 0 ? '+' : ''}{stats.orderGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 mr-4">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rata-rata Nilai Pesanan
                </p>
                <p className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Per transaksi
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Trend Revenue</h3>
            <BarChart3 size={20} className="text-gray-400" />
          </div>
          <RevenueChart period={dateRange} />
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Status Pesanan</h3>
            <PieChart size={20} className="text-gray-400" />
          </div>
          {stats && (
            <OrderStatusChart 
              pending={stats.pendingOrders}
              completed={stats.completedOrders}
              cancelled={stats.cancelledOrders}
            />
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
            <Link
              href="/finance/transactions"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{transaction.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {transaction.customerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/finance/reports"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center">
            <FileText size={24} className="text-blue-600 mr-4" />
            <div>
              <h4 className="font-medium">Laporan Keuangan</h4>
              <p className="text-sm text-gray-500">Generate laporan detail</p>
            </div>
          </div>
        </Link>

        <Link
          href="/finance/transactions"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center">
            <DollarSign size={24} className="text-green-600 mr-4" />
            <div>
              <h4 className="font-medium">Manajemen Transaksi</h4>
              <p className="text-sm text-gray-500">Kelola pembayaran</p>
            </div>
          </div>
        </Link>

        <Link
          href="/finance/analytics"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center">
            <BarChart3 size={24} className="text-purple-600 mr-4" />
            <div>
              <h4 className="font-medium">Analytics</h4>
              <p className="text-sm text-gray-500">Analisis mendalam</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}