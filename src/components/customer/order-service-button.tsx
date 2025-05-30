// src/components/customer/order-service-button.tsx - FIXED VERSION
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Wrench, Loader2, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

interface OrderServiceButtonProps {
  serviceId: number;
  serviceName: string;
  className?: string;
}

export default function OrderServiceButton({
  serviceId,
  serviceName,
  className = "",
}: OrderServiceButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleOrderService = async () => {
    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      
      // Langsung redirect ke orders page
      router.push("/customer/orders");
      
      // Optional: Bisa tambahkan toast info
      toast.success("Silakan buat pesanan baru untuk layanan ini");
      
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal memproses permintaan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsultation = () => {
    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    // Redirect ke WhatsApp untuk konsultasi
    const message = `Halo, saya ingin berkonsultasi tentang layanan ${serviceName}`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleOrderService}
        disabled={isLoading}
        className={className || "flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition"}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Wrench size={16} className="mr-2" />
            Pesan Jasa
          </>
        )}
      </button>
      
      <button
        onClick={handleConsultation}
        className="flex items-center justify-center px-3 py-2 border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md font-medium transition"
        title="Konsultasi via WhatsApp"
      >
        <MessageSquare size={16} />
      </button>
    </div>
  );
}