// src/app/admin/products/view/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Loader2, Package, Trash2 } from "lucide-react";
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
  sku: string | null;
  weight: number | null;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export default function ViewProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const productPublicId = params.id;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with publicId:', productPublicId);
        
        // Coba dengan endpoint yang benar
        const response = await fetch(`/api/products/${productPublicId}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Produk tidak ditemukan");
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Product data:', data);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Gagal memuat data produk: " + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (productPublicId) {
      fetchProduct();
    }
  }, [productPublicId]);

  const handleDeleteProduct = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productPublicId}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menghapus produk");
      }
      
      toast.success("Produk berhasil dihapus");
      router.push('/admin/products');
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Gagal menghapus produk");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <span className="ml-2">Memuat data produk...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Produk tidak ditemukan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Produk dengan ID "{productPublicId}" tidak ditemukan atau telah dihapus.
        </p>
        <Link
          href="/admin/products"
          className="inline-flex items-center px-4 py-2 bg-primary-600 rounded-md text-white hover:bg-primary-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Daftar Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/products"
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Detail Produk</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/admin/products/edit/${product.publicId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDeleteProduct}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Hapus
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Gambar Produk</h2>
            
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main image */}
                <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                  <Image
                    src={product.images[activeImageIndex].url}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Image thumbnails */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((image, index) => (
                      <div 
                        key={image.id} 
                        className={`h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden cursor-pointer border-2 ${
                          activeImageIndex === index 
                            ? 'border-primary-500' 
                            : 'border-transparent'
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <Image
                          src={image.url}
                          alt={`${product.name} thumbnail`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md">
                <Package size={64} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Produk</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nama Produk</p>
                <p className="text-lg font-medium">{product.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kategori</p>
                <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                  {product.category?.name || "Tidak ada kategori"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Deskripsi</p>
                <div className="text-gray-700 dark:text-gray-300 prose dark:prose-invert">
                  {product.description.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Pricing & Inventory */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Harga & Inventori</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Harga</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stok</p>
                <p className="text-xl font-semibold">
                  {product.stock} unit
                  {product.stock <= 5 && (
                    <span className="ml-2 text-sm text-amber-600 dark:text-amber-400">
                      (Stok menipis)
                    </span>
                  )}
                </p>
              </div>
              
              {product.sku && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SKU</p>
                  <p>{product.sku}</p>
                </div>
              )}
              
              {product.weight && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Berat</p>
                  <p>
                    {product.weight >= 1000000 
                      ? `${(product.weight / 1000000).toFixed(2)} ton`
                      : product.weight >= 1000 
                        ? `${(product.weight / 1000).toFixed(2)} kg`
                        : `${product.weight} gram`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Tambahan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Aktif
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Dibuat</p>
                <p>{new Date(product.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long", 
                  year: "numeric",
                })}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Terakhir Diupdate</p>
                <p>{new Date(product.updatedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Gambar</p>
                <p>{product.images?.length || 0} gambar</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/admin/products"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Kembali ke Daftar
            </Link>
            <Link
              href={`/admin/products/edit/${product.publicId}`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Edit Produk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}