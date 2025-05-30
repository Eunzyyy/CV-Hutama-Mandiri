"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Tags, 
  Search, 
  Package,
  Loader2,
  Grid,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Category {
  id: number;
  publicId: string;
  name: string;
  description?: string;
  _count: {
    products: number;
  };
}

export default function CustomerProductCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        type: "PRODUCT",
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/categories?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCategories(data);
      } else {
        throw new Error(data.error || "Gagal memuat kategori");
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast.error(error.message || "Gagal memuat kategori");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get("search") as string;
    setSearchQuery(query);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Kategori Produk</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Jelajahi produk berdasarkan kategori
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="relative max-w-md">
          <input
            type="text"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori..."
            className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/customer/products?category=${category.publicId}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Tags size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center text-gray-400 group-hover:text-blue-600 transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {category.name}
              </h3>
              
              {category.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Package size={14} className="mr-2" />
                <span>{category._count.products} produk</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <Tags size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Tidak Ada Kategori</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery
              ? `Tidak ada kategori yang sesuai dengan pencarian "${searchQuery}"`
              : "Belum ada kategori produk yang tersedia"}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {!isLoading && categories.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Kategori
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {categories.reduce((sum, cat) => sum + cat._count.products, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Produk
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(categories.reduce((sum, cat) => sum + cat._count.products, 0) / categories.length)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Rata-rata per Kategori
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}