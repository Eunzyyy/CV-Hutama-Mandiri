// src/app/admin/categories/products/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface Category {
  id: number;
  publicId: string;
  name: string;
  description?: string;
  type: string;
  _count: {
    products: number;
    services: number;
  };
}

export default function EditProductCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {};
    
    const name = formData.get("name") as string;
    
    if (!name || name.trim() === "") {
      newErrors.name = "Nama kategori wajib diisi";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (!validateForm(formData)) {
      toast.error("Silakan periksa kembali data yang diinput");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;

      const response = await fetch(`/api/categories/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Gagal mengupdate kategori');
      }
      
      toast.success("Kategori produk berhasil diupdate");
      router.push("/admin/categories/products");
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error(error.message || "Gagal mengupdate kategori");
    } finally {
      setIsSubmitting(false);
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
          Kategori yang Anda cari tidak ditemukan atau telah dihapus.
        </p>
        <Link
          href="/admin/categories/products"
          className="inline-flex items-center px-4 py-2 bg-primary-600 rounded-md text-white"
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
            href="/admin/categories/products"
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Kategori Produk</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Edit kategori: {category.name}
            </p>
          </div>
        </div>
      </div>

      {/* Category Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <span className="font-medium">Total Produk:</span> {category._count.products}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
              ID: {category.publicId}
            </p>
          </div>
          {category._count.products > 0 && (
            <div className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ Kategori ini memiliki produk terkait
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
              Informasi Kategori
            </h2>
            
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nama Kategori *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={category.name}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Masukkan nama kategori"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={category.description || ""}
                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Masukkan deskripsi kategori (opsional)"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/categories/products"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Batal
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}