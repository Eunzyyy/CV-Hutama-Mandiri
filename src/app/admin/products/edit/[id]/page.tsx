// src/app/admin/products/edit/[id]/page.tsx (FIXED VERSION)
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
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weightUnit, setWeightUnit] = useState<string>("gram");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function untuk konversi berat dari gram ke unit yang dipilih
  const convertWeightFromGrams = (weightInGrams: number, unit: string) => {
    switch (unit) {
      case 'kg':
        return weightInGrams / 1000;
      case 'ton':
        return weightInGrams / 1000000;
      case 'gram':
      default:
        return weightInGrams;
    }
  };

  // Helper function untuk detect unit yang tepat dari berat gram
  const detectWeightUnit = (weightInGrams: number) => {
    if (weightInGrams >= 1000000) return 'ton';
    if (weightInGrams >= 1000) return 'kg';
    return 'gram';
  };

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching product with publicId:', params.id);
        
        // Fetch product details
        const productRes = await fetch(`/api/products/${params.id}`);
        console.log('Product response status:', productRes.status);
        
        if (!productRes.ok) {
          if (productRes.status === 404) {
            throw new Error("Produk tidak ditemukan");
          }
          const errorData = await productRes.json();
          throw new Error(errorData.error || "Gagal memuat produk");
        }
        
        const productData = await productRes.json();
        console.log('Product data received:', productData);

        // Fetch categories with PRODUCT type filter
        const categoriesRes = await fetch("/api/categories?type=PRODUCT");
        console.log('Categories response status:', categoriesRes.status);
        
        if (!categoriesRes.ok) {
          throw new Error("Gagal memuat kategori");
        }
        
        const categoriesData = await categoriesRes.json();
        console.log('Categories data received:', categoriesData);

        setProduct(productData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        // Set unit berat yang sesuai
        if (productData.weight) {
          const unit = detectWeightUnit(productData.weight);
          setWeightUnit(unit);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

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
      if ((product?.images.length || 0) - imagesToDelete.length + images.length + newFiles.length > 5) {
        toast.error("Maksimal 5 gambar yang diperbolehkan");
        return;
      }
      
      setImages([...images, ...newFiles]);

      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  const removeNewImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]); // Release object URL
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  const toggleDeleteExistingImage = (imageId: number) => {
    if (imagesToDelete.includes(imageId)) {
      setImagesToDelete(imagesToDelete.filter(id => id !== imageId));
    } else {
      setImagesToDelete([...imagesToDelete, imageId]);
    }
  };

  const isImageMarkedForDeletion = (imageId: number) => {
    return imagesToDelete.includes(imageId);
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
    if (weight && weight.trim() !== "" && isNaN(parseFloat(weight))) {
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
      // Convert weight based on selected unit
      const weightValue = formData.get("weight") as string;
      const weightUnitValue = formData.get("weightUnit") as string;
      
      if (weightValue && weightValue.trim() !== "") {
        let weightInGrams = parseFloat(weightValue);
        
        // Convert to grams based on unit
        switch (weightUnitValue) {
          case 'kg':
            weightInGrams = weightInGrams * 1000;
            break;
          case 'ton':
            weightInGrams = weightInGrams * 1000000;
            break;
          case 'gram':
          default:
            // Already in grams
            break;
        }
        
        // Replace weight in formData
        formData.set("weight", weightInGrams.toString());
      }

      // Add images to delete
      if (imagesToDelete.length > 0) {
        formData.append("deleteImages", JSON.stringify(imagesToDelete));
      }
      
      // Add new images
      formData.delete("images"); // Clear existing images field from form
      images.forEach(image => {
        formData.append('images', image);
      });
      
      console.log('Sending PUT request to:', `/api/products/${params.id}`);
      
      // Call API to update product
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        body: formData,
      });
      
      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        throw new Error(errorData.error || 'Gagal mengupdate produk');
      }
      
      const updatedProduct = await response.json();
      console.log('Updated product:', updatedProduct);
      
      toast.success("Produk berhasil diupdate");
      router.push(`/admin/products/view/${params.id}`);
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Gagal mengupdate produk");
    } finally {
      setIsSubmitting(false);
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
          Produk dengan ID "{params.id}" tidak ditemukan atau telah dihapus.
        </p>
        <Link
          href="/admin/products"
          className="inline-flex items-center px-4 py-2 bg-primary-600 rounded-md text-white"
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
            href={`/admin/products/view/${params.id}`}
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Produk</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Edit: {product.name}
            </p>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <span className="font-medium">Product ID:</span> {product.publicId}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <span className="font-medium">Kategori:</span> {product.category?.name}
            </p>
          </div>
          <div className="text-xs text-blue-500 dark:text-blue-300">
            Data berhasil dimuat
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
                  Nama Produk *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={product.name}
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
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
                  defaultValue={product.categoryId}
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
                defaultValue={product.description}
                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
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
                  defaultValue={product.price}
                  className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
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
                  defaultValue={product.stock}
                  className={`w-full px-3 py-2 border ${errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
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
                  defaultValue={product.sku || ""}
                  className={`w-full px-3 py-2 border ${errors.sku ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
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
                    defaultValue={product.weight ? convertWeightFromGrams(product.weight, weightUnit) : ""}
                    className={`w-full px-3 py-2 border ${errors.weight ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                  />
                  <select
                    name="weightUnit"
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value)}
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
                  Berat saat ini: {product.weight ? 
                    `${product.weight >= 1000000 
                      ? `${(product.weight / 1000000).toFixed(2)} ton`
                      : product.weight >= 1000 
                        ? `${(product.weight / 1000).toFixed(2)} kg`
                        : `${product.weight} gram`
                    }` : 'Belum diset'} (disimpan dalam gram)
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
              {/* Existing Images */}
              {product.images && product.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gambar yang Ada
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {product.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className={`h-32 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 ${
                          isImageMarkedForDeletion(image.id) ? 'opacity-30' : ''
                        }`}>
                          <Image
                            src={image.url}
                            alt={`Product ${product.name}`}
                            width={150}
                            height={150}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleDeleteExistingImage(image.id)}
                          className={`absolute -top-2 -right-2 p-1 rounded-full ${
                            isImageMarkedForDeletion(image.id) 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-red-500 hover:bg-red-600'
                          } text-white`}
                          title={isImageMarkedForDeletion(image.id) ? "Batalkan hapus" : "Hapus gambar"}
                        >
                          {isImageMarkedForDeletion(image.id) ? "+" : <X size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tambah Gambar Baru {images.length > 0 && `(${images.length})`}
                </label>
                
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
                          onClick={() => removeNewImage(index)}
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
                      (product.images.length - imagesToDelete.length + images.length) >= 5 ? 'opacity-50 cursor-not-allowed' : ''
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
                      id="productImages"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={(product.images.length - imagesToDelete.length + images.length) >= 5}
                    />
                  </label>
                </div>
                
                {(product.images.length - imagesToDelete.length + images.length) >= 5 && (
                  <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">
                    Batas maksimum 5 gambar telah tercapai. Hapus beberapa gambar untuk menambahkan yang baru.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/admin/products/view/${params.id}`}
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