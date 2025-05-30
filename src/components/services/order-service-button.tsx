// src/components/services/order-service-button.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface OrderServiceButtonProps {
  service: {
    id: string;
    publicId: string;
    name: string;
    price: number;
  };
  className?: string;
}

export default function OrderServiceButton({ service, className = "" }: OrderServiceButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/customer/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.publicId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${service.name} ditambahkan ke keranjang`);
      } else {
        throw new Error(data.error || "Gagal menambahkan ke keranjang");
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Gagal menambahkan ke keranjang");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderNow = () => {
    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    // Redirect ke halaman order dengan service yang dipilih
    router.push(`/customer/order/create?serviceId=${service.publicId}`);
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <ShoppingCart size={16} className="mr-2" />
            Tambah ke Keranjang
          </>
        )}
      </button>
      
      <button
        onClick={handleOrderNow}
        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
      >
        Pesan Sekarang
      </button>
    </div>
  );
}