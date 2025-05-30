//src/app/owner/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Star,
  Package,
  Wrench,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3,
  FileText,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalServices: number;
  pendingOrders: number;
  pendingPayments: number;
  averageRating: number;
  monthlyGrowth: number;
  recentActivity: Array<{
    title: string;
    time: string;
  }>;
}

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (session) {
      fetchDashboardStats();
      
      // Auto refresh setiap 30 detik
      const interval = setInterval(() => {
        fetchDashboardStats(true);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [session]); // ✅ HANYA session, TIDAK ada selectedPeriod!

  // Auto refresh saat window focus (user kembali ke tab)
  useEffect(() => {
    const handleFocus = () => {
      if (session) {
        fetchDashboardStats(true);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        fetchDashboardStats(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  const fetchDashboardStats = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      setIsRefreshing(true);
      setError(null);
    } else {
      setIsLoading(true);
      setError(null);
    }

    console.log("🔄 Fetching owner dashboard stats...");

    const response = await fetch('/api/owner/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    console.log("📡 Owner dashboard response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Owner dashboard API error:", errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    
    const data = await response.json();
    console.log("✅ Owner dashboard data received:", data);
    
    setStats(data);
    setError(null);
    setLastUpdated(new Date());
    
    if (isRefresh) {
      toast.success('Data berhasil diperbarui');
    }
  } catch (error) {
    console.error('❌ Owner dashboard fetch error:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
    
    if (!isRefresh) {
      toast.error('Gagal memuat data dashboard');
    } else {
      toast.error('Gagal memperbarui data');
    }
    
    // NO FALLBACK DATA - just set stats to null
    setStats(null);
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
  }
};

  const handleRefresh = () => {
    fetchDashboardStats(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp size={16} className="text-green-500" />;
    if (growth < 0) return <ArrowDown size={16} className="text-red-500" />;
    return <TrendingUp size={16} className="text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600 dark:text-green-400";
    if (growth < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Memuat dashboard owner...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">Gagal memuat data dashboard</p>
        <button 
          onClick={() => fetchDashboardStats()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Owner
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Business overview CV Hutama Mandiri Indotech
          </p>
          {error && (
            <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
              <AlertTriangle size={16} className="mr-2" />
              Mode: Fallback data (API issue)
            </div>
          )}
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString('id-ID')}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign size={24} />
              </div>
              <div className="ml-4">
                <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(stats.monthlyGrowth)}
                  <span className="text-blue-100 text-sm ml-1">
                    {stats.monthlyGrowth}% growth
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString('id-ID')}</p>
              <p className="text-green-100 text-sm">Active customers</p>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString('id-ID')}</p>
              <p className="text-purple-100 text-sm">All time</p>
            </div>
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Monthly Growth</p>
              <p className="text-2xl font-bold">{stats.monthlyGrowth}%</p>
              <p className="text-orange-100 text-sm">vs last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Business Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Package size={32} className="mx-auto text-blue-600 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
                <p className="text-xs text-blue-600">Available items</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Wrench size={32} className="mx-auto text-green-600 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Services</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalServices}</p>
                <p className="text-xs text-green-600">CNC services</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Clock size={32} className="mx-auto text-yellow-600 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingOrders}</p>
                <p className="text-xs text-yellow-600">Needs attention</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Star size={32} className="mx-auto text-purple-600 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating}/5</p>
                <p className="text-xs text-purple-600">Customer satisfaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/owner/analytics"
                className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition group"
              >
                <BarChart3 size={20} className="text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900 dark:text-white">Business Analytics</span>
              </Link>
              <Link
                href="/owner/users"
                className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition group"
              >
                <Users size={20} className="text-green-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900 dark:text-white">User Management</span>
              </Link>
              <Link
                href="/owner/reports"
                className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition group"
              >
                <FileText size={20} className="text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900 dark:text-white">Business Reports</span>
              </Link>
              <Link
                href="/finance"
                className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition group"
              >
                <Eye size={20} className="text-orange-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900 dark:text-white">Finance View</span>
              </Link>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertTriangle size={20} className="text-orange-500 mr-2" />
              System Status
            </h3>
            <div className="space-y-3">
              {stats.pendingPayments > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    🔔 {stats.pendingPayments} pembayaran menunggu verifikasi
                  </p>
                </div>
              )}
              
              {stats.pendingOrders > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    ⏳ {stats.pendingOrders} pesanan menunggu konfirmasi
                  </p>
                </div>
              )}

              {stats.pendingPayments === 0 && stats.pendingOrders === 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    ✅ All systems running smoothly
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Business Activity</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live updates</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {stats.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                    <Activity size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Tidak ada aktivitas terbaru</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Aktivitas bisnis akan muncul di sini secara real-time
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalRevenue / (stats.totalOrders || 1))}
          </p>
          <p className="text-sm text-gray-500">Avg Order Value</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {((stats.totalOrders - stats.pendingOrders) / stats.totalOrders * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">Completion Rate</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts + stats.totalServices}</p>
          <p className="text-sm text-gray-500">Total Offerings</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalRevenue > 1000000000 ? '1B+' : formatCurrency(stats.totalRevenue).replace('Rp', 'Rp ')}
          </p>
          <p className="text-sm text-gray-500">Revenue Target</p>
        </div>
      </div>
    </div>
  );
}