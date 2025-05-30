"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package,
  Loader2,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

interface CartItem {
  productId: number;
  quantity: number;
  product: {
    id: number;
    publicId: string;
    name: string;
    price: number;
    stock: number;
    images: { url: string }[];
    category: { name: string };
  };
}

export default function CustomerCartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        if (cartData.length > 0) {
          await fetchCartProductDetails(cartData);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
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
        const cartWithDetails = cartData.map(cartItem => {
          const product = products.find((p: any) => p.id === cartItem.productId);
          return product ? {
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            product: product,
          } : null;
        }).filter(Boolean);

        setCartItems(cartWithDetails as CartItem[]);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Gagal memuat detail produk");
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      const savedCart = localStorage.getItem("cart") || "[]";
      const cartData = JSON.parse(savedCart);
      const updatedCart = cartData.map((item: any) => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      setCartItems(prev => prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));

      toast.success("Keranjang diperbarui");
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Gagal memperbarui keranjang");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = (productId: number) => {
    setIsUpdating(true);
    try {
      const savedCart = localStorage.getItem("cart") || "[]";
      const cartData = JSON.parse(savedCart);
      const updatedCart = cartData.filter((item: any) => item.productId !== productId);
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      setCartItems(prev => prev.filter(item => item.productId !== productId));

      toast.success("Produk dihapus dari keranjang");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Gagal menghapus produk");
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
      localStorage.removeItem("cart");
      setCartItems([]);
      toast.success("Keranjang dikosongkan");
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/auth/signin");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    
    router.push("/customer/checkout");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {getTotalItems()} item(s) dalam keranjang
          </p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Kosongkan Keranjang
          </button>
        )}
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/customer/products/${item.product.publicId}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-600 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.product.category.name}
                    </p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                      Rp {item.product.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock || isUpdating}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      disabled={isUpdating}
                      className="p-2 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                      title="Hapus dari Keranjang"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {item.quantity > item.product.stock && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
                    Stok tidak mencukupi. Tersedia: {item.product.stock}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Ringkasan Pesanan</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} item)</span>
                  <span className="font-medium">
                    Rp {getTotalPrice().toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span className="text-gray-500">Akan dihitung</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Rp {getTotalPrice().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cartItems.some(item => item.quantity > item.product.stock)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-md font-medium transition flex items-center justify-center"
              >
                Lanjutkan ke Checkout
                <ArrowRight size={18} className="ml-2" />
              </button>

              <Link
                href="/customer/products"
                className="block w-full text-center mt-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Lanjutkan Belanja
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Keranjang Kosong</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Belum ada produk di keranjang Anda. Mulai berbelanja sekarang!
          </p>
          <Link
            href="/customer/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
          >
            Mulai Belanja
          </Link>
        </div>
      )}
    </div>
  );
}