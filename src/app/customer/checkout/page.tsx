"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard,
  Truck,
  Shield,
  Loader2,
  Edit
} from "lucide-react";
import { toast } from "react-hot-toast";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    publicId: string;
    name: string;
    price: number;
    stock: number;
    images: { url: string }[];
    weight?: number;
  };
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("regular");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [shippingCost, setShippingCost] = useState(0);
  const [formData, setFormData] = useState({
    shippingAddress: "",
    notes: "",
    phone: "",
  });

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load cart from localStorage
      const savedCart = localStorage.getItem("cart");
      if (!savedCart || JSON.parse(savedCart).length === 0) {
        toast.error("Keranjang kosong");
        router.push("/customer/cart");
        return;
      }

      // Fetch product details and user profile
      const [cartData, profileResponse] = await Promise.all([
        fetchCartProductDetails(JSON.parse(savedCart)),
        fetch("/api/profile"),
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
        setFormData({
          shippingAddress: profileData.address || "",
          notes: "",
          phone: profileData.phone || "",
        });
      }

      setCartItems(cartData);
      calculateShipping(cartData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCartProductDetails = async (cartData: any[]) => {
    try {
      const productIds = cartData.map(item => item.productId);
      const response = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });

      if (response.ok) {
        const products = await response.json();
        return cartData.map(cartItem => {
          const product = products.find((p: any) => p.id === cartItem.productId);
          return {
            id: cartItem.productId,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            product: product,
          };
        }).filter(item => item.product);
      }
      return [];
    } catch (error) {
      console.error("Error fetching product details:", error);
      return [];
    }
  };

  const calculateShipping = (items: CartItem[]) => {
    const totalWeight = items.reduce((total, item) => {
      return total + (item.product.weight || 0) * item.quantity;
    }, 0);

    let cost = 0;
    if (shippingMethod === "regular") {
      cost = totalWeight > 5000 ? 25000 : 15000; // 5kg threshold
    } else if (shippingMethod === "express") {
      cost = totalWeight > 5000 ? 40000 : 30000;
    }

    setShippingCost(cost);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotal = () => {
    return getSubtotal() + shippingCost;
  };

  const validateForm = () => {
    if (!formData.shippingAddress.trim()) {
      toast.error("Alamat pengiriman wajib diisi");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Nomor telepon wajib diisi");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: getTotal(),
        shippingAddress: formData.shippingAddress,
        notes: formData.notes,
        shippingMethod,
        paymentMethod,
        shippingCost,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        
        // Clear cart
        localStorage.removeItem("cart");
        
        toast.success("Pesanan berhasil dibuat!");
        router.push(`/customer/orders/${order.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Gagal membuat pesanan");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Gagal membuat pesanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Silakan login untuk melanjutkan checkout
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-bold mb-2">Keranjang Kosong</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tidak ada item untuk di-checkout
        </p>
        <button
          onClick={() => router.push("/customer/products")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Lengkapi informasi pesanan Anda
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <MapPin size={18} className="mr-2 text-blue-600" />
                  Alamat Pengiriman
                </h3>
                <button
                  type="button"
                  onClick={() => router.push("/customer/profile")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  <Edit size={14} className="mr-1" />
                  Edit Profil
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Masukkan alamat lengkap termasuk kode pos"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Truck size={18} className="mr-2 text-green-600" />
                Metode Pengiriman
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="shipping"
                    value="regular"
                    checked={shippingMethod === "regular"}
                    onChange={(e) => {
                      setShippingMethod(e.target.value);
                      calculateShipping(cartItems);
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Pengiriman Regular (3-5 hari)</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Estimasi tiba dalam 3-5 hari kerja
                    </div>
                  </div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    Rp 15.000
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === "express"}
                    onChange={(e) => {
                      setShippingMethod(e.target.value);
                      calculateShipping(cartItems);
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Pengiriman Express (1-2 hari)</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Estimasi tiba dalam 1-2 hari kerja
                    </div>
                  </div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    Rp 30.000
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <CreditCard size={18} className="mr-2 text-purple-600" />
                Metode Pembayaran
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === "transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Transfer Bank</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      BCA, Mandiri, BNI, BRI
                    </div>
                  </div>
                  <Shield size={16} className="text-green-500" />
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 opacity-50">
                  <input
                    type="radio"
                    name="payment"
                    value="ewallet"
                    disabled
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">E-Wallet</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      OVO, GoPay, DANA (Segera Hadir)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Catatan Pesanan</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Catatan tambahan untuk pesanan (opsional)"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Ringkasan Pesanan</h3>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity}x Rp {item.product.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
                  <span>Rp {getSubtotal().toLocaleString("id-ID")}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Ongkos Kirim</span>
                  <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Rp {getTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Buat Pesanan"
                )}
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                Dengan melakukan pemesanan, Anda menyetujui syarat dan ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}