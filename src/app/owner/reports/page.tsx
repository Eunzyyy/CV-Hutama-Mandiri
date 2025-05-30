// src/app/owner/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Filter
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ReportData {
  financialSummary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    growthRate: number;
  };
  userMetrics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    retentionRate: number;
  };
  productPerformance: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  servicePerformance: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    orders: number;
    users: number;
  }>;
}

export default function OwnerReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("comprehensive");

  useEffect(() => {
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      generateReport();
    }
  }, [startDate, endDate, reportType]);

  const generateReport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/owner/reports?startDate=${startDate}&endDate=${endDate}&type=${reportType}`
      );

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        throw new Error("Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Gagal membuat laporan");
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: string) => {
    try {
      setIsGenerating(true);
      const response = await fetch(
        `/api/owner/reports/export?startDate=${startDate}&endDate=${endDate}&type=${reportType}&format=${format}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `owner-report-${startDate}-${endDate}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh`);
      } else {
        throw new Error("Failed to export report");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Gagal mengunduh laporan");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Business Reports</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Comprehensive business analysis and performance reports
        </p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Report Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="financial">Financial Only</option>
              <option value="users">User Analytics</option>
              <option value="products">Product Performance</option>
              <option value="services">Service Performance</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <FileText size={16} className="mr-2" />
              )}
              Generate
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-md font-medium mb-3">Export Options</h4>
          <div className="flex gap-3">
            <button
              onClick={() => exportReport("pdf")}
              disabled={isGenerating || !reportData}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Download size={16} className="mr-2" />
              )}
              PDF
            </button>
            <button
              onClick={() => exportReport("xlsx")}
              disabled={isGenerating || !reportData}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Download size={16} className="mr-2" />
              )}
              Excel
            </button>
            <button
              onClick={() => exportReport("csv")}
              disabled={isGenerating || !reportData}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Download size={16} className="mr-2" />
              )}
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign size={24} className="text-green-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    Rp {reportData.financialSummary.totalRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className={`text-sm flex items-center mt-1 ${
                    reportData.financialSummary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp size={14} className="mr-1" />
                    {reportData.financialSummary.growthRate}% growth
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <ShoppingCart size={24} className="text-blue-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{reportData.financialSummary.totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users size={24} className="text-purple-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{reportData.userMetrics.totalUsers}</p>
                  <p className="text-sm text-gray-500">
                    +{reportData.userMetrics.newUsers} new
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package size={24} className="text-orange-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    Rp {reportData.financialSummary.averageOrderValue.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Top Products</h3>
              </div>
              <div className="p-6">
                {reportData.productPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.productPerformance.map((product, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sales} sales</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Rp {product.revenue.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No product data</p>
                )}
              </div>
            </div>

            {/* Top Services */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Top Services</h3>
              </div>
              <div className="p-6">
                {reportData.servicePerformance.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.servicePerformance.map((service, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.orders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Rp {service.revenue.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No service data</p>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Monthly Trends</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      New Users
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.monthlyTrends.map((trend, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {trend.month}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        Rp {trend.revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {trend.orders}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {trend.users}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}