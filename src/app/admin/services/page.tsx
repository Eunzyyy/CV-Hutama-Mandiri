// src/app/admin/services/page.tsx - COMPLETE FIXED VERSION
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  Wrench,
  Edit,
  Eye,
  Trash2,
  Loader2,
  AlertTriangle 
} from "lucide-react";

interface Service {
  id: number;
  publicId: string;
  name: string;
  description: string;
  price: number;
  category: {
    id: number;
    publicId: string;
    name: string;
  };
  images: Array<{
    id: number;
    url: string;
  }>;
  _count?: {
    orderItems?: number;
    orders?: number;
    reviews?: number;
  };
  createdAt: string;
  isActive: boolean;
}

interface Category {
  id: number;
  publicId: string;
  name: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchServices(),
      fetchCategories()
    ]);
  }, []);

  const fetchServices = async () => {
    try {
      console.log("🔍 Fetching services...");
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const url = `/api/services${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetch URL:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Services response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Services API error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Services result:", result);

      // ✅ Handle both formats: direct array or {success: true, data: []}
      let servicesData = [];
      if (Array.isArray(result)) {
        servicesData = result;
      } else if (result.success && Array.isArray(result.data)) {
        servicesData = result.data;
      } else if (result.data && Array.isArray(result.data)) {
        servicesData = result.data;
      } else {
        console.error("Invalid services response format:", result);
        servicesData = [];
      }

      setServices(servicesData);
      console.log(`✅ Loaded ${servicesData.length} services`);

    } catch (error) {
      console.error("❌ Error fetching services:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error(`Gagal memuat jasa: ${error instanceof Error ? error.message : "Unknown error"}`);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("🔍 Fetching service categories...");
      
      const response = await fetch("/api/categories?type=SERVICE");
      console.log("Categories response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Categories result:", result);
        
        // Handle direct array response
        if (Array.isArray(result)) {
          setCategories(result);
        } else if (result.data && Array.isArray(result.data)) {
          setCategories(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleCategoryFilter = (categoryPublicId: string) => {
    setSelectedCategory(categoryPublicId);
    // Auto fetch when category changes
    setTimeout(() => {
      fetchServices();
    }, 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Memuat jasa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Jasa
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola jasa yang tersedia di toko
          </p>
        </div>
        <Link
          href="/admin/services/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} className="mr-2" />
          Tambah Jasa
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari jasa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Cari
            </button>
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.publicId}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-red-600 mr-2" />
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-medium">
                Gagal memuat jasa
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
              <button
                onClick={fetchServices}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
            >
              {/* Service Image */}
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0].url}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wrench size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                    {service.category?.name || 'No Category'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {service.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {service.description}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatPrice(service.price)}
                  </span>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      {service._count?.orderItems || service._count?.orders || 0} order
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(service.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    service.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {service.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/services/view/${service.publicId}`}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <Eye size={16} className="mr-1" />
                    Lihat
                  </Link>
                  <Link
                    href={`/admin/services/edit/${service.publicId}`}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <Wrench size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedCategory ? "Jasa tidak ditemukan" : "Tidak Ada Jasa"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || selectedCategory 
              ? "Coba ubah kata kunci pencarian atau filter kategori"
              : "Tidak ada jasa yang tersedia saat ini"
            }
          </p>
          
          <div className="flex justify-center gap-3">
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setTimeout(fetchServices, 100);
                }}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Reset Filter
              </button>
            )}
            <Link
              href="/admin/services/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} className="mr-2" />
              Tambah Jasa Baru
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}