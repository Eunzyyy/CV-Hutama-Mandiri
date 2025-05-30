// src/app/services/page.tsx - FIXED (similar fixes)
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import OrderServiceButton from "@/components/customer/order-service-button";
import { Wrench, Clock, Users, Star, Filter, Package, Search } from "lucide-react";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const categoryId = searchParams.category ? Number(searchParams.category) : undefined;
  const searchQuery = searchParams.search || "";

  const categories = await prisma.category.findMany({
    where: {
      type: "SERVICE", // ✅ Add type filter
      services: {
        some: {},
      },
    },
  });

  const services = await prisma.service.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery } }, // ✅ Remove mode for MySQL
              { description: { contains: searchQuery } },
            ],
          }
        : {}),
    },
    include: {
      category: true, // ✅ Add category include
      images: true, // ✅ Add images include
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen">
      <div className="pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Layanan Jasa Profesional</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Solusi lengkap untuk kebutuhan machining, fabrikasi, dan maintenance industri Anda
            </p>
            
            <div className="max-w-xl mx-auto">
              <form className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="Cari layanan..."
                  className="w-full py-3 pl-12 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <button
                  type="submit"
                  className="absolute right-4 top-2.5 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                >
                  Cari
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <Users size={32} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="text-2xl font-bold">500+</h3>
              <p className="text-gray-600 dark:text-gray-400">Customer Puas</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <Wrench size={32} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="text-2xl font-bold">15+</h3>
              <p className="text-gray-600 dark:text-gray-400">Tahun Pengalaman</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <Star size={32} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="text-2xl font-bold">4.9/5</h3>
              <p className="text-gray-600 dark:text-gray-400">Rating Customer</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
                <div className="flex items-center mb-6">
                  <Filter size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-bold">Filter</h2>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Kategori</h3>
                  <div className="space-y-2">
                    <Link
                      href="/services"
                      className={`block px-3 py-2 rounded-md transition ${
                        !categoryId
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      Semua Layanan
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/services?category=${category.id}${searchQuery ? `&search=${searchQuery}` : ""}`}
                        className={`block px-3 py-2 rounded-md transition ${
                          categoryId === category.id
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-3/4">
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {service.images[0] ? ( // ✅ Now includes images
                          <Image
                            src={service.images[0].url}
                            alt={service.name}
                            width={600}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Wrench size={48} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
                            {service.category.name} {/* ✅ Now includes category */}
                          </span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            Rp {service.price.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                          {service.name}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                          {service.description}
                        </p>

                        <div className="flex gap-3">
                          <Link
                            href={`/services/${service.id}`}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium text-center transition"
                          >
                            Lihat Detail
                          </Link>
                          <OrderServiceButton
                            serviceId={service.id}
                            serviceName={service.name}
                            className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md font-medium transition"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Tidak Ada Layanan</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery
                      ? `Tidak ada layanan yang sesuai dengan pencarian "${searchQuery}"`
                      : "Tidak ada layanan yang tersedia untuk kategori ini"}
                  </p>
                  <Link
                    href="/services"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                  >
                    Lihat Semua Layanan
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Mengapa Memilih Kami?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Pengalaman bertahun-tahun dan komitmen terhadap kualitas membuat kami menjadi pilihan terpercaya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">Teknologi Modern</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Menggunakan mesin dan teknologi terdepan untuk hasil maksimal
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">Tim Berpengalaman</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Operator dan teknisi bersertifikat dengan pengalaman puluhan tahun
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">Tepat Waktu</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Komitmen penuh terhadap deadline dan jadwal yang telah disepakati
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">Kualitas Terjamin</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Quality control ketat dan garansi untuk setiap hasil pekerjaan
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Memulai Proyek Anda?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Konsultasikan kebutuhan industri Anda dengan tim ahli kami. Gratis estimasi dan konsultasi teknis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Konsultasi Gratis
            </Link>
            <Link
              href="tel:+6281234567890"
              className="px-8 py-3 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition"
            >
              Hubungi Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}