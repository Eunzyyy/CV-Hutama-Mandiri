//src/app/customer/services/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Wrench, 
  Search, 
  Filter, 
  Grid,
  List,
  Loader2,
  Star,
  Clock,
  Users
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

interface Service {
  id: number;
  publicId: string;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category: Category;
  images: ServiceImage[];
}

export default function CustomerServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch categories
      const categoriesRes = await fetch("/api/categories?type=SERVICE");
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
      
      // Fetch services
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      params.append("sort", sortBy);
      
      const servicesRes = await fetch(`/api/services?${params}`);
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } else {
        throw new Error("Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data layanan");
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get("search") as string;
    setSearchQuery(query);
    
    // Update URL
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (selectedCategory) params.append("category", selectedCategory);
    router.push(`/customer/services?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (categoryId) params.append("category", categoryId);
    router.push(`/customer/services?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Layanan Jasa Profesional</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Solusi lengkap untuk kebutuhan machining, fabrikasi, dan maintenance industri
        </p>
      </div>
      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Search Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari layanan..."
                className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <button
                type="submit"
                className="absolute right-3 top-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <div className="relative">
              <select
                value={selectedCategory || ""}
                onChange={(e) => handleCategoryChange(e.target.value || null)}
                className="w-full py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.publicId}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Sort */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="price_low">Harga Terendah</option>
              <option value="price_high">Harga Tertinggi</option>
              <option value="name">Nama A-Z</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="lg:col-span-2 flex justify-end">
            <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid/List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : services.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        }`}>
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              {/* Service Image */}
              <div className={`bg-gray-200 dark:bg-gray-700 ${
                viewMode === "list" ? "w-64 h-40 flex-shrink-0" : "h-48"
              }`}>
                {service.images && service.images.length > 0 ? (
                  <Image
                    src={service.images[0].url}
                    alt={service.name}
                    width={viewMode === "list" ? 256 : 400}
                    height={viewMode === "list" ? 160 : 200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wrench size={viewMode === "list" ? 32 : 48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
                    {service.category.name}
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    Mulai Rp {service.price.toLocaleString("id-ID")}
                  </span>
                </div>

                <Link href={`/customer/services/${service.publicId}`}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 transition">
                    {service.name}
                  </h3>
                </Link>

                <p className={`text-gray-600 dark:text-gray-400 mb-6 ${
                  viewMode === "list" ? "line-clamp-3" : "line-clamp-4"
                }`}>
                  {service.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link
                    href={`/customer/services/${service.publicId}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium text-center transition"
                  >
                    Lihat Detail
                  </Link>
                  <OrderServiceButton
                    serviceId={service.id}
                    serviceName={service.name}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Tidak Ada Layanan</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedCategory
              ? "Tidak ada layanan yang sesuai dengan filter Anda"
              : "Tidak ada layanan yang tersedia saat ini"}
          </p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                router.push("/customer/services");
              }}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}