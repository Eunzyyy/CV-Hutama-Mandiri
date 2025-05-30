//src/app/finance/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Calculator,
  FileText,
  AlertTriangle,
  RefreshCw,
  Wallet,
  BarChart3,
  Calendar,
  Users,
  ShoppingCart,
  Target,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Eye,
  Bell,
  Zap,
  PieChart,
  LineChart
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  totalPendingPayments: number;
  totalPaidOrders: number;
  totalUnpaidOrders: number;
  paymentRate: number;
  averageOrderValue: number;
  totalTransactions: number;
  pendingAmount: number;
  collectionRate: number;
  revenueGrowth: number;
  monthlyGrowth: number;
  weeklyGrowth: number;
  topPaymentMethod: string;
  cashflowTrend: Array<{
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  recentActivity: Array<{
    title: string;
    time: string;
    amount: number;
    type: 'income' | 'expense' | 'pending';
    status: 'completed' | 'pending' | 'failed';
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  topCustomers: Array<{
    name: string;
    totalSpent: number;
    orderCount: number;
  }>;
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export default function AdvancedFinanceDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [showAlerts, setShowAlerts] = useState(true);
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
  }, [session, selectedPeriod]);

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
    console.log("🔄 Fetching finance dashboard stats...");
    
    if (isRefresh) {
      setIsRefreshing(true);
      setError(null);
    } else {
      setIsLoading(true);
      setError(null);
    }

    const response = await fetch(`/api/finance/dashboard?period=${selectedPeriod}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    console.log("📡 Finance dashboard response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Finance dashboard API error:", errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    
    const data = await response.json();
    console.log("✅ Finance dashboard data received:", data);
    
    setStats(data);
    setError(null);
    setLastUpdated(new Date());
    
    if (isRefresh) {
      toast.success('Financial data updated');
    }
  } catch (error) {
    console.error('❌ Finance dashboard fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setError(errorMessage);
    
    if (!isRefresh) {
      toast.error(`Failed to load finance dashboard`);
    } else {
      toast.error(`Failed to update data`);
    }
    
    // Set stats to null on error
    setStats(null);
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
  }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExportData = () => {
    toast.success('Financial export started...');
    // TODO: Implement export functionality
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading finance dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Finance Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time financial insights & analytics • CV Hutama Mandiri Indotech
          </p>
          {error && (
            <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
              <AlertTriangle size={16} className="mr-2" />
              Mode: Fallback data (API connection issue)
            </div>
          )}
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString('id-ID')}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportData}
            className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardStats(true)}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Smart Alerts */}
      {showAlerts && stats?.alerts && stats.alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                  : alert.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    {alert.type === 'error' && <XCircle size={16} className="text-red-500 mr-2" />}
                    {alert.type === 'warning' && <AlertTriangle size={16} className="text-yellow-500 mr-2" />}
                    {alert.type === 'info' && <Bell size={16} className="text-blue-500 mr-2" />}
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    {alert.priority === 'high' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">High</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                </div>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign size={24} />
              </div>
              <div className="ml-4">
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(stats?.revenueGrowth || 0)}
                  <span className="text-green-100 text-sm ml-1">
                    {stats?.revenueGrowth || 0}% vs last period
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Calendar size={24} />
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats?.monthlyRevenue || 0)}
              </p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(stats?.monthlyGrowth || 0)}
                <span className="text-blue-100 text-sm ml-1">
                  {stats?.monthlyGrowth || 0}% growth
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Rate */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Target size={24} />
            </div>
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Payment Rate</p>
              <p className="text-2xl font-bold">{stats?.paymentRate || 0}%</p>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats?.paymentRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Zap size={24} />
            </div>
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Collection Rate</p>
              <p className="text-2xl font-bold">{stats?.collectionRate || 0}%</p>
              <p className="text-orange-100 text-sm mt-1">
                {formatCurrency(stats?.pendingAmount || 0)} pending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Analytics</h2>
              <div className="flex items-center space-x-2">
                <PieChart size={20} className="text-gray-400" />
                <span className="text-sm text-gray-500">Real-time</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Paid Orders */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle size={32} className="mx-auto text-green-600 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalPaidOrders || 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  {((stats?.totalPaidOrders || 0) / ((stats?.totalPaidOrders || 0) + (stats?.totalUnpaidOrders || 0)) * 100).toFixed(1)}% success rate
                </p>
              </div>

              {/* Unpaid Orders */}
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle size={32} className="mx-auto text-red-600 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Unpaid Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalUnpaidOrders || 0}</p>
                <p className="text-xs text-red-600 mt-1">
                  {formatCurrency((stats?.totalUnpaidOrders || 0) * (stats?.averageOrderValue || 0))} total
                </p>
              </div>

              {/* Pending Verification */}
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Clock size={32} className="mx-auto text-yellow-600 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalPendingPayments || 0}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Action required
                </p>
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Payment Methods Distribution</h3>
              {stats?.paymentMethods?.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                    <span className="font-medium">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(method.amount)}</p>
                    <p className="text-sm text-gray-500">{method.count} transactions ({method.percentage}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Enhanced Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Finance Actions</h3>
            <div className="space-y-3">
              <Link
                href="/finance/payments"
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition group"
              >
                <div className="flex items-center">
                  <CreditCard size={20} className="text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-gray-900 dark:text-white">Verify Payments</span>
                </div>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {stats?.totalPendingPayments || 0}
                </span>
              </Link>
              
              <Link
                href="/finance/reports"
                className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition group"
              >
                <FileText size={20} className="text-green-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900 dark:text-white">Financial Reports</span>
              </Link>
              
              <Link
                href="/finance/analytics"
                className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition group"
              >
                <BarChart3 size={20} className="text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900 dark:text-white">Advanced Analytics</span>
              </Link>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Customers</h3>
            <div className="space-y-3">
              {stats?.topCustomers?.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.orderCount} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Financial Activity</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live updates</span>
              </div>
              <Link
                href="/finance/transactions"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
        <div className="p-6">
          {stats?.recentActivity?.length ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  <div className={`p-2 rounded-lg mr-4 ${
                    activity.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : activity.type === 'expense'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    {activity.type === 'income' && <TrendingUp size={16} className="text-green-600" />}
                    {activity.type === 'expense' && <TrendingDown size={16} className="text-red-600" />}
                    {activity.type === 'pending' && <Clock size={16} className="text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${
                          activity.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : activity.type === 'expense'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {activity.type === 'expense' ? '-' : '+'}
                          {formatCurrency(activity.amount)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : activity.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No recent financial activity</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Financial transactions will appear here in real-time
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalTransactions || 0}</p>
          <p className="text-sm text-gray-500">Total Transactions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.averageOrderValue || 0)}</p>
          <p className="text-sm text-gray-500">Avg Order Value</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.dailyRevenue || 0)}</p>
          <p className="text-sm text-gray-500">Today's Revenue</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.topPaymentMethod || '-'}</p>
          <p className="text-sm text-gray-500">Top Payment Method</p>
        </div>
      </div>
    </div>
  );
}