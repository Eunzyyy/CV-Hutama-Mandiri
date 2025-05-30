"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Package, 
  Search, 
  Filter, 
  Grid,
  List,
  Loader2,
  ShoppingBag,
  Heart,
  Plus
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Category {
  id: number;
  publicId: string;
  name: string;
}

interface ProductImage {
  id: number;
  url: string;
}

interface Product {
  id: number;
  publicId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  category: Category;
  images: ProductImage[];
}

export default function CustomerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams?.get("category") || null
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
      const categoriesRes = await fetch("/api/categories?type=PRODUCT");
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
      
      // Fetch products
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      params.append("sort", sortBy);
      
      const productsRes = await fetch(`/api/products?${params}`);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data produk");
      setProducts([]);
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
    router.push(`/customer/products?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (categoryId) params.append("category", categoryId);
    router.push(`/customer/products?${params.toString()}`);
  };

  const handleOrderDirect = (productId: number) => {
    router.push(`/customer/orders/create?productId=${productId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Katalog Produk</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Jelajahi sparepart berkualitas untuk kebutuhan industri Anda
          </p>
        </div>
        <Link
          href="/customer/orders/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Buat Pesanan
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Search Form */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
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

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <div className="relative">
              <select
                value={selectedCategory || ""}
                onChange={(e) => handleCategoryChange(e.target.value || null)}
                className="w-full py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
              className="w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="price_low">Harga Terendah</option>
              <option value="price_high">Harga Tertinggi</option>
              <option value="name">Nama A-Z</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="lg:col-span-1 flex justify-end">
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

      {/* Products Grid/List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        }`}>
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              {/* Product Image */}
              <div className={`bg-gray-200 dark:bg-gray-700 ${
                viewMode === "list" ? "w-48 h-32 flex-shrink-0" : "h-48"
              }`}>
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    width={viewMode === "list" ? 200 : 400}
                    height={viewMode === "list" ? 150 : 200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={viewMode === "list" ? 32 : 48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                    {product.category.name}
                  </span>
                  <button className="text-gray-400 hover:text-red-500 transition">
                    <Heart size={18} />
                  </button>
                </div>

                <Link href={`/customer/products/${product.publicId}`}>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 hover:text-blue-600 line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                <p className={`text-gray-500 dark:text-gray-400 text-sm mb-3 ${
                  viewMode === "list" ? "line-clamp-2" : "line-clamp-2"
                }`}>
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    product.stock > 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}>
                    {product.stock > 0 ? `Stok: ${product.stock}` : "Habis"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOrderDirect(product.id)}
                    disabled={product.stock <= 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-md text-sm font-medium transition flex items-center justify-center"
                  >
                    <ShoppingBag size={16} className="mr-1" />
                    Pesan Langsung
                  </button>
                  <Link
                    href={`/customer/products/${product.publicId}`}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition text-center"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Tidak Ada Produk</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedCategory
              ? "Tidak ada produk yang sesuai dengan filter Anda"
              : "Tidak ada produk yang tersedia saat ini"}
          </p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                router.push("/customer/products");
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