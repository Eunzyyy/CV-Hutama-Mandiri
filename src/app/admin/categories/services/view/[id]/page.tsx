// src/app/admin/categories/services/view/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Loader2, Wrench, Calendar, Package } from "lucide-react";
import { toast } from "react-hot-toast";

interface Category {
  id: number;
  publicId: string;
  name: string;
  description?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
    services: number;
  };
}

export default function ViewServiceCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategory();
  }, [params.id]);

  const fetchCategory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/categories/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Kategori tidak ditemukan");
        }
        throw new Error("Gagal memuat kategori");
      }
      
      const data = await response.json();
      setCategory(data);
    } catch (error: any) {
      console.error("Error fetching category:", error);
      toast.error(error.message || "Gagal memuat kategori");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${params.id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menghapus kategori");
      }
      
      toast.success("Kategori berhasil dihapus");
      router.push("/admin/categories/services");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Gagal menghapus kategori");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Kategori tidak ditemukan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Kategori dengan ID "{params.id}" tidak ditemukan atau telah dihapus.
        </p>
        <Link
          href="/admin/categories/services"
          className="inline-flex items-center px-4 py-2 bg-primary-600 rounded-md text-white hover:bg-primary-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Daftar Kategori
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
            href="/admin/categories/services"
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Detail Kategori Jasa</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/admin/categories/services/edit/${category.publicId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDeleteCategory}
            disabled={isDeleting || category._count.services > 0}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={category._count.services > 0 ? "Tidak dapat dihapus karena masih memiliki jasa" : "Hapus kategori"}
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
        {/* Category Icon & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="bg-green-100 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {category.name}
            </h2>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium rounded-full">
              Kategori Jasa
            </span>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Dasar</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nama Kategori</p>
                <p className="text-lg font-medium">{category.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Public ID</p>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {category.publicId}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Deskripsi</p>
                <div className="text-gray-700 dark:text-gray-300">
                  {category.description ? (
                    <p>{category.description}</p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Tidak ada deskripsi
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Statistik</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center">
                  <Wrench size={24} className="text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Jasa</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {category._count.services}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center">
                  <Package size={24} className="text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-lg font-semibold">
                      {category._count.services > 0 ? (
                        <span className="text-green-600 dark:text-green-400">Aktif</span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">Kosong</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {category._count.services > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Catatan:</strong> Kategori ini tidak dapat dihapus karena masih memiliki {category._count.services} jasa terkait.
                </p>
              </div>
            )}
          </div>
          
          {/* Timestamps */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Waktu</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Dibuat</p>
                  <p className="font-medium">
                    {new Date(category.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long", 
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Terakhir Diupdate</p>
                  <p className="font-medium">
                    {new Date(category.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/admin/categories/services"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Kembali ke Daftar
            </Link>
            <Link
              href={`/admin/categories/services/edit/${category.publicId}`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Edit Kategori
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}