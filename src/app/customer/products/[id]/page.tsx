import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import AddToCartButton from "@/components/customer/add-to-cart-button";
import { ArrowLeft, Package, Star, Truck, Shield, Award, Heart } from "lucide-react";
import { notFound } from "next/navigation";

export default async function CustomerProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const productPublicId = params.id;
  
  // Fetch detail produk
  const product = await prisma.product.findUnique({
    where: { publicId: productPublicId },
    include: {
      category: true,
      images: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
  
  if (!product) {
    notFound();
  }
  
  // Fetch produk terkait
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      publicId: { not: productPublicId },
    },
    take: 4,
    include: {
      images: true,
      category: true,
    },
  });

  // Hitung rating rata-rata
  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
        <Link href="/customer/products" className="hover:text-blue-600">
          Produk
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/customer/products?category=${product.category.publicId}`} className="hover:text-blue-600">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{product.name}</span>
      </div>

      {/* Back Button */}
      <Link
        href="/customer/products"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
      >
        <ArrowLeft size={16} className="mr-1" />
        Kembali ke Katalog
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={80} className="text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div key={image.id} className="bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden aspect-square cursor-pointer hover:opacity-75 transition">
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
                  {product.category.name}
                </span>
                <button className="p-2 text-gray-400 hover:text-red-500 transition">
                  <Heart size={20} />
                </button>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= averageRating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({product.reviews.length} ulasan)
                </span>
              </div>
              
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                Rp {product.price.toLocaleString("id-ID")}
              </div>
            </div>
            
            {/* Product Details */}
            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`font-medium ${
                    product.stock > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {product.stock > 0 ? "Tersedia" : "Habis"}
                  </span>
                </div>
                
                {product.stock > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Stok</span>
                    <span className="font-medium">{product.stock} unit</span>
                  </div>
                )}
                
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">SKU</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                )}
                
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Berat</span>
                    <span className="font-medium">
                      {product.weight >= 1000000 
                        ? `${(product.weight / 1000000).toFixed(2)} ton`
                        : product.weight >= 1000 
                          ? `${(product.weight / 1000).toFixed(2)} kg`
                          : `${product.weight} gram`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Deskripsi Produk
              </h3>
              <div className="prose prose-gray dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
            
            {/* Features */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Keunggulan Produk
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Kualitas terjamin</span>
                </div>
                <div className="flex items-center">
                  <Award size={16} className="mr-2 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sertifikat ISO</span>
                </div>
                <div className="flex items-center">
                  <Truck size={16} className="mr-2 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Gratis ongkir Jakarta</span>
                </div>
                <div className="flex items-center">
                  <Package size={16} className="mr-2 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Kemasan aman</span>
                </div>
              </div>
            </div>
            
            {/* Add to Cart */}
            <div className="pt-6">
              <AddToCartButton
                productId={product.id}
                disabled={product.stock <= 0}
                showQuantity={true}
              />
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link
                  href="/customer/cart"
                  className="text-center py-2 px-4 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md font-medium transition"
                >
                  Lihat Keranjang
                </Link>
                <button className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition">
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      {product.reviews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Ulasan Pelanggan</h2>
          
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {review.user.name}
                      </h4>
                      <time className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("id-ID")}
                      </time>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`${
                            star <= review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
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
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Produk Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <Link
                key={related.id}
                href={`/customer/products/${related.publicId}`}
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
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {related.category.name}
                  </span>
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
  );
}