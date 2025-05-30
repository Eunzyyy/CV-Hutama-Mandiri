// src/app/services/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import OrderServiceButton from "@/components/customer/order-service-button";
import { ArrowLeft, Wrench, Clock, CheckCircle, Star, Phone, Mail } from "lucide-react";
import { notFound } from "next/navigation";

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { action?: string };
}) {
  const serviceId = Number(params.id);
  
  // Fetch detail service
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      category: true,
      images: true,
    },
  });
  
  if (!service) {
    notFound();
  }
  
  // Fetch related services
  const relatedServices = await prisma.service.findMany({
    where: {
      categoryId: service.categoryId,
      id: { not: serviceId },
    },
    take: 4,
    include: {
      images: true,
      category: true,
    },
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Link
          href="/services"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition"
        >
          <ArrowLeft size={16} className="mr-1" />
          Kembali ke Layanan
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Service Image */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {service.images.length > 0 ? (
                <Image
                  src={service.images[0].url}
                  alt={service.name}
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 flex items-center justify-center">
                  <Wrench size={80} className="text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Service Info */}
            <div className="space-y-6">
              <div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
                  {service.category.name}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-3">
                  {service.name}
                </h1>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  Mulai dari Rp {service.price.toLocaleString("id-ID")}
                </p>
              </div>
              
              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Deskripsi Layanan
                </h3>
                <div className="prose prose-gray dark:prose-invert">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Service Features */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Keunggulan Layanan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Kualitas terjamin</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Teknologi modern</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tim berpengalaman</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Garansi pekerjaan</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Konsultasi gratis</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tepat waktu</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="pt-6 space-y-4">
                <OrderServiceButton
                  serviceId={service.id}
                  serviceName={service.name}
                />
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="tel:+6281234567890"
                    className="flex items-center justify-center py-2 px-4 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition"
                  >
                    <Phone size={16} className="mr-2" />
                    Telepon
                  </a>
                  <Link
                    href="/contact"
                    className="flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition"
                  >
                    <Mail size={16} className="mr-2" />
                    Email
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Alur Proses Layanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">1</span>
              </div>
              <h3 className="font-bold mb-2">Konsultasi</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Diskusi kebutuhan dan spesifikasi detail dengan tim ahli kami
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">2</span>
              </div>
              <h3 className="font-bold mb-2">Estimasi</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Perhitungan biaya, waktu pengerjaan, dan jadwal yang detail
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">3</span>
              </div>
              <h3 className="font-bold mb-2">Pengerjaan</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Proses produksi dengan monitoring ketat dan update berkala
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">4</span>
              </div>
              <h3 className="font-bold mb-2">Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Quality check final dan pengiriman sesuai jadwal yang disepakati
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Pertanyaan Umum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2">Berapa lama waktu pengerjaan?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Waktu pengerjaan bervariasi tergantung kompleksitas proyek. Kami akan memberikan estimasi yang akurat setelah konsultasi.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Apakah ada garansi untuk hasil pekerjaan?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ya, kami memberikan garansi untuk setiap hasil pekerjaan sesuai dengan standar kualitas yang telah ditetapkan.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Bagaimana sistem pembayaran?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Kami menerima pembayaran bertahap (DP dan pelunasan) dengan berbagai metode pembayaran yang fleksibel.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Apakah bisa custom sesuai kebutuhan?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Tentu saja! Kami spesialis dalam mengerjakan proyek custom sesuai dengan spesifikasi dan kebutuhan khusus Anda.
              </p>
            </div>
          </div>
        </div>
        
        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Layanan Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedServices.map((related) => (
                <Link
                  key={related.id}
                  href={`/services/${related.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition"
                >
                  <div className="h-40 bg-gray-200 dark:bg-gray-700">
                    {related.images[0] ? (
                      <Image
                        src={related.images[0].url}
                        alt={related.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Wrench size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {related.category.name}
                    </span>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {related.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      Mulai Rp {related.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}