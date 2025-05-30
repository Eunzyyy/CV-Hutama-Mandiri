// src/components/PaymentVerification.tsx
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";

interface PaymentVerificationProps {
  paymentId: number;
  orderId: number;
  amount: number;
  onVerified: () => void;
}

export default function PaymentVerification({ 
  paymentId, 
  orderId, 
  amount, 
  onVerified 
}: PaymentVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (status: "PAID" | "REJECTED") => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Gagal verifikasi payment');
      }

      toast.success(`Payment ${status === 'PAID' ? 'diterima' : 'ditolak'}`);
      onVerified();

    } catch (error) {
      toast.error('Gagal verifikasi payment');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleVerify("PAID")}
        disabled={isLoading}
        className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        <CheckCircle size={16} className="mr-1" />
        Terima
      </button>
      <button
        onClick={() => handleVerify("REJECTED")}
        disabled={isLoading}
        className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        <XCircle size={16} className="mr-1" />
        Tolak
      </button>
    </div>
  );
}