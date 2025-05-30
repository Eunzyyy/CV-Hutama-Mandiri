//src/components/finance/revenue-chart.tsx
"use client";

import { useState, useEffect } from "react";

interface RevenueChartProps {
  period: string;
}

interface RevenueData {
  date: string;
  revenue: number;
}

export default function RevenueChart({ period }: RevenueChartProps) {
  const [data, setData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with dummy data
    const generateDummyData = () => {
      const dummyData: RevenueData[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        dummyData.push({
          date: date.toISOString(),
          revenue: Math.floor(Math.random() * 10000000) + 5000000 // 5M - 15M
        });
      }
      
      return dummyData;
    };

    // Simulate loading
    setTimeout(() => {
      setData(generateDummyData());
      setIsLoading(false);
    }, 1000);
  }, [period]);

  const formatCurrency = (amount: number) => {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  };

  const maxRevenue = Math.max(...data.map(item => item.revenue));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-48">
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center group">
            <div 
              className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative"
              style={{ 
                height: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 5}%`,
                minHeight: '8px'
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {formatCurrency(item.revenue)}
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-center">
              {new Date(item.date).toLocaleDateString("id-ID", { 
                day: '2-digit', 
                month: 'short' 
              })}
            </span>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada data untuk periode ini
          </p>
        </div>
      )}
    </div>
  );
}