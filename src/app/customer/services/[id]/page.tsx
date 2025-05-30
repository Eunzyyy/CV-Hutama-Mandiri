"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Wrench,
  Clock,
  CheckCircle,
  Star,
  Phone,
  Mail,
  Users,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import OrderServiceButton from "@/components/customer/order-service-button";

interface Category {
  id: number;
  publicId: string;
  name: string;
}

interface ServiceImage {
  id: number;
  url: string;
}

interface Review {
  id: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

interface Service {
  id: number;
  publicId: string;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category: Category;
  images: ServiceImage[];
  reviews: Review[];
}

export default function CustomerServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchServiceDetail();
      fetchRelatedServices();
    }
  }, [params.id]);

  const fetchServiceDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/services/${params.id}`);
      
      if (!response.ok) {
        throw new Error("Service not found");
      }
      
      const data = await response.json();
      setService(data);
    } catch (error) {
      console.error("Error fetching service:", error);
      setError("Gagal memuat detail layanan");
      toast.error("Gagal memuat detail layanan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedServices = async () => {
    try {
      const response = await fetch(`/api/services/${params.id}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedServices(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching related services:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Layanan Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-4">
            {error || "Layanan yang Anda cari tidak tersedia"}
          </p>
          <Link
            href="/customer/services"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Kembali ke Layanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
        <Link href="/customer/services" className="hover:text-blue-600">
          Layanan
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{service.name}</span>
      </div>

      {/* Back Button */}
      <Link
        href="/customer/services"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft size={16} className="mr-1" />
        Kembali ke Layanan
      </Link>

      {/* Service Detail */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Service Image */}
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video">
              {service.images && service.images.length > 0 ? (
                <Image
                  src={service.images[0].url}
                  alt={service.name}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Wrench size={80} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Service Info */}
          <div className="space-y-6">
            <div>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
                {service.category.name}
              </span>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-3 mb-2">
                {service.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <Star size={16} className="text-gray-300" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({service.reviews.length} ulasan)
                </span>
              </div>

              <div className="text-2xl font-bold text-blue-600 mb-4">
                Mulai dari Rp {service.price.toLocaleString("id-ID")}
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Deskripsi Layanan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {service.description}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Keunggulan Layanan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center">
                  <CheckCircle size={16} className="mr-2 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Kualitas terjamin
                  </span>
                </div>
                <div className="flex items-center">
                  <Award size={16} className="mr-2 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tim bersertifikat
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tepat waktu
                  </span>
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-2 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Konsultasi gratis
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <OrderServiceButton
                serviceId={service.id}
                serviceName={service.name}
              />

              <div className="grid grid-cols-2 gap-3">
                
                  href="tel:+6281234567890"
                  className="flex items-center justify-center py-2 px-4 border border-green-600 text-green-600 hover:bg-green-50 rounded-md font-medium transition"
                <div>
                  <Phone size={16} className="mr-2" />
                  Telepon
                </div>
                <Link
                  href="/contact"
                  className="flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition"
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Alur Proses Layanan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-100 text-blue-600">
              <span className="font-bold text-xl">1</span>
            </div>
            <h3 className="font-bold mb-2">Konsultasi</h3>
            <p className="text-gray-600 text-sm">
              Diskusi kebutuhan dan spesifikasi detail dengan tim ahli kami
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100 text-green-600">
              <span className="font-bold text-xl">2</span>
            </div>
            <h3 className="font-bold mb-2">Estimasi</h3>
            <p className="text-gray-600 text-sm">
              Perhitungan biaya, waktu pengerjaan, dan jadwal yang detail
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-yellow-100 text-yellow-600">
              <span className="font-bold text-xl">3</span>
            </div>
            <h3 className="font-bold mb-2">Pengerjaan</h3>
            <p className="text-gray-600 text-sm">
              Proses produksi dengan monitoring ketat dan update berkala
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-purple-100 text-purple-600">
              <span className="font-bold text-xl">4</span>
            </div>
            <h3 className="font-bold mb-2">Delivery</h3>
            <p className="text-gray-600 text-sm">
              Quality check final dan pengiriman sesuai jadwal yang disepakati
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {service.reviews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Ulasan Pelanggan</h2>

          <div className="space-y-6">
            {service.reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {review.user.name}
                      </h4>
                      <time className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("id-ID")}
                      </time>
                    </div>

                    <div className="flex items-center mb-2">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <Star size={14} className="text-gray-300" />
                    </div>

                    {review.comment && (
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Layanan Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedServices.map((related) => (
              <Link
                key={related.id}
                href={`/customer/services/${related.publicId}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition"
              >
                <div className="h-40 bg-gray-200">
                  {related.images && related.images.length > 0 ? (
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
                  <span className="text-xs text-blue-600 font-medium">
                    {related.category.name}
                  </span>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {related.name}
                  </h3>
                  <p className="text-blue-600 font-bold text-sm">
                    Mulai Rp {related.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}