// src/app/admin/services/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";

interface Category {
  id: number;
  publicId: string;
  name: string;
  type: string;
}

export default function CreateServicePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?type=SERVICE");
        if (response.ok) {
          const data = await response.json();
          console.log("Categories data:", data);
          // Pastikan data adalah array
          setCategories(Array.isArray(data) ? data : []);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Gagal memuat kategori");
        setCategories([]); // Set empty array sebagai fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Validasi ukuran file (max 2MB)
      const oversizedFiles = newFiles.filter(file => file.size > 2 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error("Beberapa file melebihi batas ukuran 2MB");
        return;
      }
      
      // Validasi tipe file
      const invalidTypeFiles = newFiles.filter(file => {
        const fileType = file.type.toLowerCase();
        return !fileType.includes('jpeg') && !fileType.includes('jpg') && !fileType.includes('png') && !fileType.includes('webp');
      });
      
      if (invalidTypeFiles.length > 0) {
        toast.error("Hanya file JPG, PNG, dan WEBP yang diperbolehkan");
        return;
      }
      
      // Validasi jumlah total file
      if (images.length + newFiles.length > 5) {
        toast.error("Maksimal 5 gambar yang diperbolehkan");
        return;
      }
      
      setImages([...images, ...newFiles]);

      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]); // Release object URL
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const categoryId = formData.get("categoryId") as string;
    
    if (!name || name.trim() === "") newErrors.name = "Nama jasa wajib diisi";
    if (!description || description.trim() === "") newErrors.description = "Deskripsi wajib diisi";
    if (!price || isNaN(parseFloat(price))) newErrors.price = "Harga wajib diisi dengan angka";
    if (!categoryId || categoryId === "") newErrors.categoryId = "Kategori wajib dipilih";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const form = e.currentTarget;
  const formData = new FormData(form);
  
  // Validate form
  if (!validateForm(formData)) {
    toast.error("Silakan periksa kembali data yang diinput");
    return;
  }
  
  setIsSubmitting(true);

  try {
    console.log("Submitting service...");
    
    // Add images to FormData
    images.forEach((image, index) => {
      formData.append('images', image);
      console.log(`Added image ${index + 1}:`, image.name);
    });
    
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(key, typeof value === 'string' ? value : 'File:', value);
    }
    
    // ✅ Call API to create service
    const response = await fetch('/api/services', {
      method: 'POST',
      body: formData,
    });
    
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Success result:", result);
    
    if (result.success) {
      toast.success(result.message || "Jasa berhasil dibuat");
      router.push("/admin/services");
    } else {
      throw new Error(result.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error("Submit error:", error);
    toast.error(`Gagal membuat jasa: ${error.message}`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/services"
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Tambah Jasa</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Buat jasa baru untuk pelanggan
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
              Informasi Dasar
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nama Jasa *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Masukkan nama jasa"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label 
                  htmlFor="categoryId" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Kategori *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  className={`w-full px-3 py-2 border ${errors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                >
                  <option value="">Pilih Kategori</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
                )}
                {!Array.isArray(categories) || categories.length === 0 && (
                  <p className="mt-1 text-sm text-amber-500">
                    Belum ada kategori jasa. <Link href="/admin/categories/services/create" className="underline">Buat kategori baru</Link>
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Deskripsi *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Jelaskan detail jasa yang ditawarkan"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
          
          {/* Pricing Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
              Harga
            </h2>
            
            <div>
              <label 
                htmlFor="price" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Harga (Rp) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Contoh: 50000"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>
          </div>
          
          {/* Images Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
              Gambar Jasa
            </h2>
            
            <div className="space-y-4">
              {/* Image previews */}
              {imagePreviewUrls.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview Gambar ({imagePreviewUrls.length}/5)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="h-32 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload button */}
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="serviceImages"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-700 cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG atau WEBP (max. 2MB)
                    </p>
                  </div>
                  <input
                    id="serviceImages"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={images.length >= 5}
                  />
                </label>
              </div>
              
              {images.length >= 5 && (
                <p className="text-xs text-amber-500 dark:text-amber-400">
                  Batas maksimum 5 gambar telah tercapai.
                </p>
              )}
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/services"
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
                  Simpan Jasa
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}