// src/app/customer/orders/[id]/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Download, Package, Tool } from "lucide-react";
import ConfirmPaymentForm from "@/components/customer/confirm-payment-form";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  const orderId = Number(params.id);
  
  // Fetch order details
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
      userId: Number(session.user.id),
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
          service: {
            include: {
              images: true,
            },
          },
        },
      },
      transactions: true,
    },
  });
  
  if (!order) {
    redirect("/customer/orders");
  }
  
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
            Menunggu Konfirmasi
          </span>
        );
      case "PROCESSING":
        return (
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
            Sedang Diproses
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            Selesai
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };
  
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "UNPAID":
        return (
          <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
            Belum Dibayar
          </span>
        );
      case "PARTIAL":
        return (
          <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
            Sebagian Dibayar
          </span>
        );
      case "PAID":
        return (
          <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            Lunas
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/customer/orders"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Kembali ke Daftar Pesanan
          </Link>
          <h1 className="text-2xl font-bold mt-2">Detail Pesanan</h1>
        </div>
        <div className="flex space-x-3">
          {order.status === "COMPLETED" && (
            <Link
              href={`/api/invoice/${order.id}`}
              className="bg-white hover:bg-gray-100 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <Download size={16} className="mr-2" />
              Download Invoice
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Pesanan #{order.orderNumber}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Dibuat pada: {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <div>{getOrderStatusBadge(order.status)}</div>
                  <div>{getPaymentStatusBadge(order.paymentStatus)}</div>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="p-6 space-y-6">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Item Pesanan
              </h3>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                      {(item.product?.images[0]?.url || item.service?.images[0]?.url) ? (
                        <img
                          src={item.product?.images[0]?.url || item.service?.images[0]?.url}
                          alt={item.product?.name || item.service?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {item.product ? <Package size={24} /> : <Tool size={24} />}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.product?.name || item.service?.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {item.product ? "Produk" : "Jasa"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 dark:text-white">
                        {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Total */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rp {order.totalAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Details & Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">Informasi Pesanan</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Metode Pembayaran
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.paymentMethod === "transfer"
                      ? "Transfer Bank"
                      : order.paymentMethod === "cash"
                      ? "Bayar di Tempat (COD)"
                      : order.paymentMethod}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Status Pesanan
                  </h3>
                  <div className="space-y-1">
                    <p className="text-gray-600 dark:text-gray-400">
                      Pesanan: {order.status === "PENDING"
                        ? "Menunggu Konfirmasi"
                        : order.status === "PROCESSING"
                        ? "Sedang Diproses"
                        : order.status === "COMPLETED"
                        ? "Selesai"
                        : "Dibatalkan"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Pembayaran: {order.paymentStatus === "UNPAID"
                        ? "Belum Dibayar"
                        : order.paymentStatus === "PARTIAL"
                        ? "Sebagian Dibayar"
                        : "Lunas"}
                    </p>
                  </div>
                </div>
              </div>
              
              {order.notes && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Catatan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Payment History */}
          {order.transactions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold">Riwayat Pembayaran</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Tanggal
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Jumlah
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Metode
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {order.transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          Rp {transaction.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Payment Section */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">Informasi Pembayaran</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Pesanan</span>
                <span className="font-medium">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
              </div>
              
              {order.transactions.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Dibayar</span>
                  <span className="font-medium">
                    Rp {order.transactions
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              
              {order.paymentStatus !== "PAID" && (
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-bold">Sisa Pembayaran</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    Rp {(
                      order.totalAmount -
                      order.transactions.reduce((sum, t) => sum + t.amount, 0)
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              
              {order.paymentMethod === "transfer" && order.paymentStatus !== "PAID" && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Transfer ke
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md space-y-2">
                    <p className="font-medium">Bank BCA</p>
                    <p>No. Rekening: 1234567890</p>
                    <p>A/N: CV Hutama Mandiri Indotech</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Confirm Payment Form */}
          {order.paymentStatus !== "PAID" && order.paymentMethod === "transfer" && (
            <ConfirmPaymentForm orderId={order.id} remainingAmount={
              order.totalAmount - order.transactions.reduce((sum, t) => sum + t.amount, 0)
            } />
          )}
        </div>
      </div>
    </div>
  );
}