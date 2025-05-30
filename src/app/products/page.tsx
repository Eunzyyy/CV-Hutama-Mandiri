// src/app/products/page.tsx - FIXED
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Filter, Package, Search } from "lucide-react";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const categoryId = searchParams.category ? Number(searchParams.category) : undefined;
  const searchQuery = searchParams.search || "";
  
  const categories = await prisma.category.findMany({
    where: {
      type: "PRODUCT", // ✅ Add type filter
      products: {
        some: {},
      },
    },
  });
  
  const products = await prisma.product.findMany({
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
            <h1 className="text-3xl font-bold mb-4">Katalog Produk</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Jelajahi berbagai sparepart berkualitas untuk kebutuhan industri dan otomotif Anda
            </p>
            
            <div className="max-w-xl mx-auto">
              <form className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="Cari produk..."
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
                      href="/products"
                      className={`block px-3 py-2 rounded-md ${
                        !categoryId
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      Semua Kategori
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.id}`}
                        className={`block px-3 py-2 rounded-md ${
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
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition"
                    >
                      <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {product.images[0] ? ( // ✅ Now includes images
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={48} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                          {product.category.name} {/* ✅ Now includes category */}
                        </p>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <p className="text-blue-600 dark:text-blue-400 font-bold">
                          Rp {product.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Tidak Ada Produk</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery
                      ? `Tidak ada produk yang sesuai dengan pencarian "${searchQuery}"`
                      : "Tidak ada produk yang tersedia untuk kategori ini"}
                  </p>
                  <Link
                    href="/products"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Lihat Semua Produk
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}