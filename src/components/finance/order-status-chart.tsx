"use client";

interface OrderStatusChartProps {
  pending: number;
  completed: number;
  cancelled: number;
}

export default function OrderStatusChart({ pending, completed, cancelled }: OrderStatusChartProps) {
  const total = pending + completed + cancelled;
  
  const pendingPercentage = total > 0 ? (pending / total) * 100 : 0;
  const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
  const cancelledPercentage = total > 0 ? (cancelled / total) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Simple Bar Chart */}
      <div className="space-y-3">
        {/* Completed */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {completed} ({completedPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completedPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Pending */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {pending} ({pendingPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${pendingPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Cancelled */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {cancelled} ({cancelledPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${cancelledPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
        </div>
      </div>
    </div>
  );
}