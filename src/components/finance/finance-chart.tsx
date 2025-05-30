"use client";

import { useState, useEffect } from "react";

interface FinanceChartProps {
  period?: string;
}

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

export default function FinanceChart({ period = "month" }: FinanceChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate dummy data for demonstration
    const generateDummyData = () => {
      const dummyData: ChartData[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        dummyData.push({
          date: date.toISOString(),
          revenue: Math.floor(Math.random() * 8000000) + 2000000, // 2M - 10M
          orders: Math.floor(Math.random() * 100) + 20 // 20 - 120 orders
        });
      }
      
      return dummyData;
    };

    // Simulate loading
    setTimeout(() => {
      setChartData(generateDummyData());
      setIsLoading(false);
    }, 800);
  }, [period]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const maxRevenue = Math.max(...chartData.map(item => item.revenue));
  const maxOrders = Math.max(...chartData.map(item => item.orders));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Orders</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(item.date).toLocaleDateString("id-ID", { 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatCurrency(item.revenue)}
              </span>
            </div>
            
            {/* Revenue Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Orders Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${maxOrders > 0 ? (item.orders / maxOrders) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                {item.orders} orders
              </span>
            </div>
          </div>
        ))}
      </div>

      {chartData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada data untuk periode ini
          </p>
        </div>
      )}
    </div>
  );
}