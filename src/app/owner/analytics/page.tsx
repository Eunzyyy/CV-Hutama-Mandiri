// src/app/owner/analytics/page.tsx - FIXED
"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AnalyticsData {
  revenueChart: Array<{ date: string; revenue: number; orders: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  topServices: Array<{ name: string; orders: number; revenue: number }>;
  monthlyComparison: {
    currentMonth: number;
    previousMonth: number;
    growth: number;
  };
}

export default function OwnerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/owner/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Gagal memuat data analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/owner/analytics/export?range=${timeRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${timeRange}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Analytics report downloaded");
      }
    } catch (error) {
      toast.error("Failed to export analytics");
    }
  };

  // ✅ Fix the calculation
  const calculateAverageOrderValue = () => {
    if (!analytics?.revenueChart || analytics.revenueChart.length === 0) {
      return 0;
    }

    const totalRevenue = analytics.revenueChart.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = analytics.revenueChart.reduce((sum, item) => sum + item.orders, 0);
    
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Business Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Analisis mendalam performa bisnis Anda
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 Hari</option>
            <option value="30d">30 Hari</option>
            <option value="90d">90 Hari</option>
            <option value="1y">1 Tahun</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign size={24} className="text-green-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Revenue Bulan Ini</p>
              <p className="text-2xl font-bold">
                Rp {analytics?.monthlyComparison?.currentMonth?.toLocaleString('id-ID') || '0'}
              </p>
              <p className={`text-sm flex items-center mt-1 ${
                (analytics?.monthlyComparison?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp size={14} className="mr-1" />
                {analytics?.monthlyComparison?.growth || 0}% vs bulan lalu
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users size={24} className="text-blue-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">
                {analytics?.userGrowth?.[analytics.userGrowth.length - 1]?.users || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 size={24} className="text-purple-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold">
                Rp {calculateAverageOrderValue().toLocaleString('id-ID')} {/* ✅ Fixed calculation */}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - implementasi chart library</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - implementasi chart library</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold">Top Products</h3>
          </div>
          <div className="p-6">
            {analytics?.topProducts?.length ? (
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} terjual</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rp {product.revenue.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Tidak ada data produk</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold">Top Services</h3>
          </div>
          <div className="p-6">
            {analytics?.topServices?.length ? (
              <div className="space-y-4">
                {analytics.topServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500">{service.orders} pesanan</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rp {service.revenue.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Tidak ada data layanan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}