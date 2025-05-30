//src/app/customer/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ShoppingCart, Package, Wrench, Star, Clock, CheckCircle } from "lucide-react";

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return null;
  }

  // Ambil statistik customer - PERBAIKAN ERROR DI SINI
  const userId = parseInt(session.user.id); // Konversi string ke integer
  
  // Validasi apakah konversi berhasil (opsional, tapi recommended)
  if (isNaN(userId)) {
    throw new Error('Invalid user ID');
  }
  
  const [totalOrders, pendingOrders, completedOrders, recentOrders] = await Promise.all([
    prisma.order.count({
      where: { userId: userId },
    }),
    prisma.order.count({
      where: { userId: userId, status: "PENDING" },
    }),
    prisma.order.count({
      where: { userId: userId, status: "DELIVERED" },
    }),
    prisma.order.findMany({
      where: { userId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            product: { select: { name: true, price: true } },
            service: { select: { name: true, price: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Selamat Datang, {session.user.name}! 👋
        </h1>
        <p className="text-blue-100">
          Kelola pesanan dan jelajahi produk & layanan terbaik kami
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Pesanan
              </p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 mr-4">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sedang Diproses
              </p>
              <p className="text-2xl font-bold">{pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-4">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Selesai
              </p>
              <p className="text-2xl font-bold">{completedOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-4">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Rating Anda
              </p>
              <p className="text-2xl font-bold">4.8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Package size={20} className="mr-2 text-blue-600" />
            Jelajahi Produk
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Temukan sparepart berkualitas untuk kebutuhan industri Anda
          </p>
          <Link
            href="/customer/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            Lihat Produk
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Wrench size={20} className="mr-2 text-green-600" />
            Layanan Jasa
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Dapatkan layanan machining dan fabrikasi profesional
          </p>
          <Link
            href="/customer/services"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            Lihat Layanan
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Pesanan Terbaru</h2>
            <Link
              href="/customer/orders"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Pesanan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.orderItems.length} item(s)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : order.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}>
                        {order.status === "PENDING" ? "Menunggu" : 
                         order.status === "PROCESSING" ? "Diproses" :
                         order.status === "DELIVERED" ? "Selesai" : "Dibatalkan"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Belum Ada Pesanan</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Mulai berbelanja produk atau pesan layanan kami
            </p>
            <Link
              href="/customer/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Mulai Belanja
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}