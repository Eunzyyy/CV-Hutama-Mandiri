// src/app/products/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
// HAPUS IMPORT NAVBAR
import AddToCartButton from "@/components/customer/add-to-cart-button";
import { ArrowLeft, Package, ShoppingCart } from "lucide-react";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = Number(params.id);
  
  // Fetch detail produk
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      images: true,
    },
  });
  
  if (!product) {
    notFound();
  }
  
  // Fetch produk terkait
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: productId },
    },
    take: 4,
    include: {
      images: true,
    },
  });
  
  return (
    <div className="min-h-screen">
      {/* HAPUS <Navbar /> */}
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Link
          href="/products"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Kembali ke Katalog
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  width={600}
                  height={400}
                  className="w-full h-80 object-contain"
                />
              ) : (
                <div className="w-full h-80 flex items-center justify-center">
                  <Package size={80} className="text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">
                  {product.category.name}
                </p>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h1>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </div>
              
              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock > 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}>
                    {product.stock > 0 ? "Tersedia" : "Habis"}
                  </span>
                </div>
                
                {product.stock > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-700 dark:text-gray-300">Stok</span>
                    <span className="font-medium">{product.stock}</span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Deskripsi
                </h3>
                <div className="prose prose-sm dark:prose-invert">
                  <p className="text-gray-600 dark:text-gray-400">
                    {product.description}
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <AddToCartButton
                  productId={product.id}
                  disabled={product.stock <= 0}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Produk Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.id}`}
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
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {related.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold">
                      Rp {related.price.toLocaleString("id-ID")}
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