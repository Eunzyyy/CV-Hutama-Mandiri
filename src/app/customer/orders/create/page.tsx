// src/app/customer/orders/create/page.tsx - DIPERBAIKI AGAR KONSISTEN
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { 
  ShoppingCart, 
  MapPin, 
  FileText,
  ArrowLeft,
  Loader2,
  Package,
  Wrench,
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard
} from "lucide-react";
import { toast } from "react-hot-toast";

// Interfaces sama seperti sebelumnya
interface OrderItem {
  id: string;
  type: 'product' | 'service';
  productId?: number;
  serviceId?: number;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
  category: string;
  image?: string;
}

interface Product {
  id: number;
  publicId: string;
  name: string;
  price: number;
  stock: number;
  images: { url: string }[];
  category: { name: string };
}

interface Service {
  id: number;
  publicId: string;
  name: string;
  price: number;
  images: { url: string }[];
  category: { name: string };
}

const PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", label: "Transfer Bank", icon: "🏦" },
  { value: "E_WALLET", label: "E-Wallet", icon: "📱" },
  { value: "COD", label: "Bayar di Tempat", icon: "🚚" },
];

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  // State management
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat data produk');
    }
  };

  const fetchServices = async () => {
  try {
    console.log("🔍 Fetching services for order...");
    
    const response = await fetch("/api/services", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log("Services API response status:", response.status);
    console.log("Services API response ok:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Services API error:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Services API result:", result);
    
    // Handle multiple response formats
    let servicesData = [];
    if (Array.isArray(result)) {
      servicesData = result;
    } else if (result.success && Array.isArray(result.data)) {
      servicesData = result.data;
    } else if (result.services && Array.isArray(result.services)) {
      servicesData = result.services;
    }
    
    setServices(servicesData);
    console.log(`✅ Loaded ${servicesData.length} services`);
    
  } catch (error) {
    console.error("❌ Error fetching services:", error);
    toast.error(`Gagal memuat jasa: ${error.message}`);
    setServices([]);
  }
};

  // Add product to order
  const addProductToOrder = (product: Product) => {
    const existingItemIndex = orderItems.findIndex(
      item => item.type === 'product' && item.productId === product.id
    );
    
    if (existingItemIndex >= 0) {
      const existingItem = orderItems[existingItemIndex];
      if (existingItem.quantity < product.stock) {
        updateQuantity(existingItemIndex, existingItem.quantity + 1);
      } else {
        toast.error('Stok tidak mencukupi');
      }
    } else {
      if (product.stock > 0) {
        const newItem: OrderItem = {
          id: `product-${product.id}`,
          type: 'product',
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock,
          category: product.category.name,
          image: product.images[0]?.url
        };
        setOrderItems([...orderItems, newItem]);
        toast.success(`${product.name} ditambahkan ke pesanan`);
      } else {
        toast.error('Produk tidak tersedia');
      }
    }
  };

  // Add service to order
  const addServiceToOrder = (service: Service) => {
    const existingItemIndex = orderItems.findIndex(
      item => item.type === 'service' && item.serviceId === service.id
    );
    
    if (existingItemIndex >= 0) {
      const existingItem = orderItems[existingItemIndex];
      updateQuantity(existingItemIndex, existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        id: `service-${service.id}`,
        type: 'service',
        serviceId: service.id,
        name: service.name,
        price: service.price,
        quantity: 1,
        category: service.category.name,
        image: service.images[0]?.url
      };
      setOrderItems([...orderItems, newItem]);
      toast.success(`${service.name} ditambahkan ke pesanan`);
    }
  };

  // Update quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    const item = orderItems[index];
    if (item.type === 'product' && item.stock && quantity > item.stock) {
      toast.error('Stok tidak mencukupi');
      return;
    }

    const newItems = [...orderItems];
    newItems[index].quantity = quantity;
    setOrderItems(newItems);
  };

  // Remove item
  const removeItem = (index: number) => {
    const newItems = orderItems.filter((_, idx) => idx !== index);
    setOrderItems(newItems);
    toast.success('Item dihapus dari pesanan');
  };

  // Calculate total
  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast.error('Tambahkan minimal satu item ke pesanan');
      return;
    }

    if (!paymentMethod) {
      toast.error('Pilih metode pembayaran');
      return;
    }

    if (!shippingAddress.trim()) {
      toast.error('Alamat pengiriman wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const orderData = {
        items: orderItems.map(item => ({
          type: item.type,
          id: item.type === 'product' ? item.productId : item.serviceId,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod,
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim() || null,
        totalAmount: getTotalAmount()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Pesanan berhasil dibuat');
        router.push(`/customer/orders/${data.order.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Gagal membuat pesanan');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter functions
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header - sama seperti admin */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Buat Pesanan Baru</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Pilih produk atau jasa yang ingin Anda pesan
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Product/Service Selection - mirip admin tapi tanpa customer selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Package size={20} className="mr-2" />
              Pilih Produk & Jasa
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk atau jasa..."
                className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Tabs - sama seperti admin */}
            <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'products'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Produk ({filteredProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'services'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Jasa ({filteredServices.length})
              </button>
            </div>

            {/* Products & Services Grid - sama seperti admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
              {activeTab === 'products' && filteredProducts.map((product) => (
                <div key={`product-${product.id}`} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.category.name}</p>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProductToOrder(product)}
                      disabled={product.stock <= 0}
                      className="flex-shrink-0 p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'services' && filteredServices.map((service) => (
                <div key={`service-${service.id}`} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                      {service.images[0] ? (
                        <Image
                          src={service.images[0].url}
                          alt={service.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Wrench size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{service.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{service.category.name}</p>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        Rp {service.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addServiceToOrder(service)}
                      className="flex-shrink-0 p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Items - sama seperti admin */}
        {orderItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCart size={20} className="mr-2" />
              Item Pesanan ({orderItems.length})
            </h3>
            
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.type === 'product' ? (
                            <Package size={20} className="text-gray-400" />
                          ) : (
                            <Wrench size={20} className="text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.type === 'product' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {item.type === 'product' ? 'Produk' : 'Jasa'}
                        </span>
                        <span>{item.category}</span>
                      </div>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        Rp {item.price.toLocaleString("id-ID")} / item
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <div className="text-right min-w-[100px]">
                      <p className="font-semibold">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Pesanan:</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  Rp {getTotalAmount().toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info - sama seperti admin tapi tanpa customer selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard size={20} className="mr-2" />
              Metode Pembayaran
            </h3>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label key={method.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-lg">{method.icon}</span>
                  <span className="font-medium">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin size={20} className="mr-2" />
              Alamat Pengiriman
            </h3>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Masukkan alamat pengiriman lengkap..."
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText size={20} className="mr-2" />
              Catatan Pesanan
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan untuk pesanan..."
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Submit Button - sama seperti admin */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || orderItems.length === 0 || !paymentMethod}
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
          >
            {isSubmitting && <Loader2 size={16} className="mr-2 animate-spin" />}
            {isSubmitting ? 'Membuat Pesanan...' : 'Buat Pesanan'}
          </button>
        </div>
      </form>
    </div>
  );
}