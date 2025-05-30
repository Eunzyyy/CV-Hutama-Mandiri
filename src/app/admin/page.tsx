// src/app/admin/page.tsx (FIXED VERSION)
import prisma from "@/lib/prisma";
import Link from "next/link";
import { CreditCard, Package, ShoppingCart, Users } from "lucide-react";

export default async function AdminDashboard() {
  // Fetch data statistik
  const totalProducts = await prisma.product.count();
  const totalServices = await prisma.service.count();
  const totalCustomers = await prisma.user.count({
    where: {
      role: "CUSTOMER",
    },
  });
  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({
    where: {
      status: "PENDING",
    },
  });
  const processingOrders = await prisma.order.count({
    where: {
      status: "PROCESSING",
    },
  });
  const shippedOrders = await prisma.order.count({
    where: {
      status: "SHIPPED",
    },
  });
  const deliveredOrders = await prisma.order.count({
    where: {
      status: "DELIVERED", // GUNAKAN DELIVERED, BUKAN COMPLETED
    },
  });

  // Fetch 5 pesanan terbaru
  const latestOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Selamat datang di dashboard admin CV Hutama Mandiri Indotech
        </p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Produk
              </p>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="mt-4 block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Kelola Produk &rarr;
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-4">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Jasa
              </p>
              <p className="text-2xl font-bold">{totalServices}</p>
            </div>
          </div>
          <Link
            href="/admin/services"
            className="mt-4 block text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
          >
            Kelola Jasa &rarr;
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-4">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Pelanggan
              </p>
              <p className="text-2xl font-bold">{totalCustomers}</p>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="mt-4 block text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
          >
            Kelola Pengguna &rarr;
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 mr-4">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Pesanan
              </p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="mt-4 block text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
          >
            Kelola Pesanan &rarr;
          </Link>
        </div>
      </div>

      {/* Status Pesanan */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">Status Pesanan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Menunggu Diproses
            </p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingOrders}
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Sedang Diproses
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {processingOrders}
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Sedang Dikirim
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {shippedOrders}
            </p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Selesai
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {deliveredOrders}
            </p>
          </div>
        </div>
      </div>

      {/* Pesanan Terbaru */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Pesanan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  ID Pesanan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Pelanggan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Tanggal
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {latestOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {order.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    Rp {order.totalAmount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : order.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          : order.status === "SHIPPED"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {order.status === "PENDING"
                        ? "Menunggu"
                        : order.status === "PROCESSING"
                        ? "Diproses"
                        : order.status === "SHIPPED"
                        ? "Dikirim"
                        : order.status === "DELIVERED"
                        ? "Selesai"
                        : "Dibatalkan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/orders/view/${order.id}`}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Lihat semua pesanan &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}