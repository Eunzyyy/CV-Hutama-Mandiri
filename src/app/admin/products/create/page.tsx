// src/app/admin/products/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";

interface Category {
  id: number;
  publicId: string;
  name: string;
}

export default function CreateProductPage() {
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
      setIsLoading(true);
      console.log("🔍 Fetching categories for product form...");
      
      const response = await fetch("/api/categories?type=PRODUCT", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Categories API response status:", response.status);
      console.log("Categories API response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Categories API error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Categories API result:", data);
      
      // ✅ Sekarang API return array langsung
      if (Array.isArray(data)) {
        setCategories(data);
        console.log(`✅ Loaded ${data.length} categories:`, data.map(c => c.name));
      } else {
        console.error("Expected array but got:", typeof data);
        setCategories([]);
        toast.error("Format response kategori tidak valid");
      }
      
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      toast.error(`Gagal memuat kategori: ${error.message}`);
      setCategories([]);
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
    const stock = formData.get("stock") as string;
    const categoryId = formData.get("categoryId") as string;
    
    if (!name || name.trim() === "") newErrors.name = "Nama produk wajib diisi";
    if (!description || description.trim() === "") newErrors.description = "Deskripsi wajib diisi";
    if (!price || isNaN(parseFloat(price))) newErrors.price = "Harga wajib diisi dengan angka";
    if (!stock || isNaN(parseInt(stock))) newErrors.stock = "Stok wajib diisi dengan angka";
    if (!categoryId || categoryId === "") newErrors.categoryId = "Kategori wajib dipilih";
    
    // Weight validation (optional but must be number if provided)
    const weight = formData.get("weight") as string;
    if (weight && weight.trim() !== "" && isNaN(parseInt(weight))) {
      newErrors.weight = "Berat harus berupa angka";
    }
    
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
      // Add images
      images.forEach(image => {
        formData.append('images', image);
      });
      
      // Call API to create product
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membuat produk');
      }
      
      const newProduct = await response.json();
      toast.success("Produk berhasil dibuat");
      router.push(`/admin/products/view/${newProduct.publicId}`);
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(error.message || "Gagal membuat produk");
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
            href="/admin/products"
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Tambah Produk Baru</h1>
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
                  Nama Produk *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Masukkan nama produk"
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
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
                )}
                {categories.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">
                    Belum ada kategori produk. 
                    <Link href="/admin/categories/products/create" className="text-primary-600 hover:text-primary-700 ml-1">
                      Buat kategori baru
                    </Link>
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
                placeholder="Jelaskan detail produk Anda"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
          
          {/* Pricing & Inventory Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
              Harga & Inventori
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="150000"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>
              
              <div>
                <label 
                  htmlFor="stock" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Stok *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  required
                  min="0"
                  className={`w-full px-3 py-2 border ${errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="10"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="sku" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  className={`w-full px-3 py-2 border ${errors.sku ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="BRG-001"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-500">{errors.sku}</p>
                )}
              </div>
              
              <div>
                <label 
                  htmlFor="weight" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Berat
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border ${errors.weight ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="500"
                  />
                  <select
                    name="weightUnit"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="gram">Gram</option>
                    <option value="kg">Kilogram</option>
                    <option value="ton">Ton</option>
                  </select>
                </div>
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-500">{errors.weight}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Berat akan disimpan dalam gram untuk perhitungan sistem
                </p>
              </div>
            </div>
          </div>
          
          {/* Images Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">
              Gambar Produk
            </h2>
            
            <div className="space-y-4">
              {/* Image previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
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
              )}
              
              {/* Upload button */}
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="productImages"
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
                      PNG, JPG atau WEBP (max. 2MB, maksimal 5 gambar)
                    </p>
                  </div>
                  <input
                    id="productImages"
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
                <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">
                  Batas maksimum 5 gambar telah tercapai.
                </p>
              )}
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/products"
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
                  Simpan Produk
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}