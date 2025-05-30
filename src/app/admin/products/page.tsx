//src/app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  Package,
  Edit,
  Eye,
  Trash2,
  Loader2,
  AlertTriangle 
} from "lucide-react";

interface Product {
  id: number;
  publicId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku?: string;
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
    orderItems: number;
    reviews: number;
  };
  createdAt: string;
  isActive: boolean;
}

interface Category {
  id: number;
  publicId: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("🔍 Fetching products...");
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetch URL:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Products response status:", response.status);
      console.log("Products response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Products API error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Products API result type:", typeof result);
      console.log("Products API result is array:", Array.isArray(result));
      console.log("Products API result:", result);

      // ✅ Handle multiple response formats
      let productsData: Product[] = [];
      
      if (Array.isArray(result)) {
        // Direct array response
        productsData = result;
        console.log("✅ Using direct array format");
      } else if (result && typeof result === 'object') {
        if (result.success && Array.isArray(result.data)) {
          // {success: true, data: []} format
          productsData = result.data;
          console.log("✅ Using success/data format");
        } else if (Array.isArray(result.products)) {
          // {products: []} format
          productsData = result.products;
          console.log("✅ Using products key format");
        } else {
          console.error("❌ Unknown response format:", result);
          throw new Error("Unknown response format");
        }
      } else {
        console.error("❌ Invalid response type:", typeof result);
        throw new Error("Invalid response type");
      }

      setProducts(productsData);
      console.log(`✅ Loaded ${productsData.length} products`);

    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error(`Gagal memuat produk: ${error instanceof Error ? error.message : "Unknown error"}`);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("🔍 Fetching categories...");
      
      const response = await fetch("/api/categories?type=PRODUCT");
      console.log("Categories response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Categories result:", result);
        
        if (Array.isArray(result)) {
          setCategories(result);
        } else if (result.success && Array.isArray(result.data)) {
          setCategories(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryFilter = (categoryPublicId: string) => {
    setSelectedCategory(categoryPublicId);
    setTimeout(() => {
      fetchProducts();
    }, 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Memuat produk...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Produk
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola produk yang tersedia di toko
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} className="mr-2" />
          Tambah Produk
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
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
            <div className="flex-1">
              <h3 className="text-red-800 dark:text-red-200 font-medium">
                Gagal memuat produk
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <button
              onClick={fetchProducts}
              className="ml-4 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
            >
              {/* Product Image */}
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                    {product.category?.name || 'No Category'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Stok: {product.stock}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/products/view/${product.publicId}`}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <Eye size={16} className="mr-1" />
                    Lihat
                  </Link>
                  <Link
                    href={`/admin/products/edit/${product.publicId}`}
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
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedCategory ? "Produk tidak ditemukan" : "Tidak Ada Produk"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || selectedCategory 
              ? "Coba ubah kata kunci pencarian atau filter kategori"
              : "Tidak ada produk yang tersedia"
            }
          </p>
          
          <div className="flex justify-center gap-3">
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setTimeout(fetchProducts, 100);
                }}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Reset Filter
              </button>
            )}
            <Link
              href="/admin/products/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} className="mr-2" />
              Tambah Produk Baru
            </Link>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm">
          <details>
            <summary className="cursor-pointer font-medium mb-2">🔧 Debug Info</summary>
            <div className="space-y-1 text-xs">
              <p><strong>Products count:</strong> {products.length}</p>
              <p><strong>Categories count:</strong> {categories.length}</p>
              <p><strong>Search query:</strong> "{searchQuery}"</p>
              <p><strong>Selected category:</strong> "{selectedCategory}"</p>
              <p><strong>Error:</strong> {error || "None"}</p>
              <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
              <div className="mt-2">
                <button
                  onClick={() => {
                    console.log("🔄 Manual refresh triggered");
                    fetchProducts();
                  }}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                >
                  Debug Refresh
                </button>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}