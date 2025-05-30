"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, Plus, Minus } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
  className?: string;
  showQuantity?: boolean;
}

export default function AddToCartButton({
  productId,
  disabled = false,
  className = "",
  showQuantity = false,
}: AddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (response.ok) {
        toast.success("Produk berhasil ditambahkan ke keranjang");
        // Optional: Refresh cart count di navbar
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        const error = await response.json();
        throw new Error(error.error || "Gagal menambahkan ke keranjang");
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Gagal menambahkan ke keranjang");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showQuantity && (
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={quantity <= 1}
          >
            <Minus size={16} />
          </button>
          <span className="px-3 py-1 min-w-[3rem] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Plus size={16} />
          </button>
        </div>
      )}
      
      <button
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        className={cn(
          "flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition",
          showQuantity ? "flex-1" : "w-full"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Menambahkan...
          </>
        ) : (
          <>
            <ShoppingCart size={16} className="mr-2" />
            Tambah Keranjang
          </>
        )}
      </button>
    </div>
  );
}