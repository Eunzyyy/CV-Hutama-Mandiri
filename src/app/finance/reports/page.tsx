//src/app/finance/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ReportData {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function FinanceReportsPage() {
  const { data: session } = useSession();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("revenue");

  useEffect(() => {
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Pilih tanggal mulai dan akhir");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/finance/reports?startDate=${startDate}&endDate=${endDate}&type=${reportType}`
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
  if (!reportData) {
    toast.error("Generate laporan terlebih dahulu");
    return;
  }

  try {
    setIsLoading(true);
    
    const response = await fetch(
      `/api/finance/reports/export?startDate=${startDate}&endDate=${endDate}&type=${reportType}&format=${format}`
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set proper filename based on format
      let extension = format;
      if (format === 'xlsx') extension = 'xlsx';
      else if (format === 'excel') extension = 'xlsx';
      
      a.download = `laporan-keuangan-${startDate}-${endDate}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh`);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to export report");
    }
  } catch (error: any) {
    console.error("Error exporting report:", error);
    toast.error(error.message || "Gagal mengunduh laporan");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate dan unduh laporan keuangan detail
        </p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Konfigurasi Laporan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="revenue">Laporan Revenue</option>
              <option value="orders">Laporan Pesanan</option>
              <option value="products">Laporan Produk</option>
              <option value="customers">Laporan Customer</option>
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
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign size={24} className="text-green-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    Rp {reportData.totalRevenue.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <ShoppingCart size={24} className="text-blue-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Total Pesanan</p>
                  <p className="text-2xl font-bold">{reportData.totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp size={24} className="text-purple-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Rata-rata Nilai Pesanan</p>
                  <p className="text-2xl font-bold">
                    Rp {reportData.averageOrderValue.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Export Laporan</h3>
            <div className="flex gap-4">
              <button
                onClick={() => exportReport("pdf")}
                disabled={isLoading || !reportData}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center transition"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Download size={16} className="mr-2" />
                )}
                Export PDF
              </button>
              <button
                onClick={() => exportReport("xlsx")}
                disabled={isLoading || !reportData}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center transition"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Download size={16} className="mr-2" />
                )}
                Export Excel
              </button>
              <button
                onClick={() => exportReport("csv")}
                disabled={isLoading || !reportData}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center transition"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Download size={16} className="mr-2" />
                )}
                Export CSV
              </button>
            </div>
          </div>

          {/* Top Products */}
          {reportData.topProducts && reportData.topProducts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Produk Terlaris</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Produk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Terjual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {product.quantity} unit
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          Rp {product.revenue.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}