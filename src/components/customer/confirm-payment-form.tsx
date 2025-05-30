// src/components/customer/confirm-payment-form.tsx - COMPLETE VERSION
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface ConfirmPaymentFormProps {
  orderId: number;
  remainingAmount: number;
}

export default function ConfirmPaymentForm({
  orderId,
  remainingAmount,
}: ConfirmPaymentFormProps) {
  const [amount, setAmount] = useState(remainingAmount);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File terlalu besar. Maksimal 10MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Hanya file gambar yang diperbolehkan (JPG, PNG, GIF)");
        return;
      }

      setPaymentProof(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast.success("File berhasil dipilih");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentProof) {
      toast.error("Harap pilih file bukti pembayaran terlebih dahulu");
      return;
    }
    
    if (amount <= 0 || amount > remainingAmount) {
      toast.error(`Jumlah tidak valid. Sisa pembayaran: Rp ${remainingAmount.toLocaleString("id-ID")}`);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Submitting payment proof...");
      
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append("orderId", orderId.toString());
      formData.append("amount", amount.toString());
      formData.append("paymentProof", paymentProof);
      
      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      console.log("API Response:", result);
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit payment");
      }
      
      setUploadSuccess(true);
      toast.success("Bukti pembayaran berhasil dikirim!");
      toast.success("Tim finance akan memverifikasi dalam 1x24 jam", { duration: 5000 });
      
      // Reset form
      setPaymentProof(null);
      setPreviewUrl(null);
      
      // Refresh page after 2 seconds
      setTimeout(() => {
        router.refresh();
      }, 2000);
      
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      toast.error(error.message || "Terjadi kesalahan saat mengirim bukti pembayaran");
    } finally {
      setLoading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-green-600 mb-2">Bukti Pembayaran Terkirim!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Terima kasih! Bukti pembayaran Anda telah berhasil diunggah.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tim finance akan memverifikasi pembayaran dalam 1x24 jam.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold">Konfirmasi Pembayaran</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Upload bukti pembayaran untuk verifikasi tim finance
        </p>
      </div>
      
      <div className="p-6">
        {/* Bank Transfer Info */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Informasi Transfer:</h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Bank:</strong> BCA</p>
            <p><strong>No. Rekening:</strong> 1234567890</p>
            <p><strong>Atas Nama:</strong> CV Hutama Mandiri Indotech</p>
            <p><strong>Jumlah:</strong> Rp {remainingAmount.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jumlah yang Dibayar (Rp) *
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              max={remainingAmount}
              className="block w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white p-3 text-lg"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Maksimal: Rp {remainingAmount.toLocaleString("id-ID")}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bukti Pembayaran *
            </label>
            <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 transition-colors">
              {previewUrl ? (
                <div className="w-full text-center">
                  <img
                    src={previewUrl}
                    alt="Preview Bukti Pembayaran"
                    className="h-48 mx-auto object-contain rounded-md shadow-md"
                  />
                  <p className="text-sm text-gray-600 mt-2">{paymentProof?.name}</p>
                  <p className="text-xs text-gray-500">{(paymentProof?.size || 0 / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentProof(null);
                      setPreviewUrl(null);
                    }}
                    className="mt-3 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium"
                    disabled={loading}
                  >
                    Hapus & Pilih Ulang
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <Upload
                    className="mx-auto h-12 w-12 text-gray-400"
                    strokeWidth={1}
                  />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none"
                    >
                      <span>Pilih file bukti pembayaran</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        disabled={loading}
                      />
                    </label>
                    <p className="pl-1">atau drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Format: PNG, JPG, GIF (Maksimal 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Penting!
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Pastikan bukti transfer jelas dan terbaca</li>
                    <li>Jumlah transfer harus sesuai dengan tagihan</li>
                    <li>Verifikasi membutuhkan waktu 1x24 jam</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !paymentProof}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Mengunggah Bukti Pembayaran...
              </>
            ) : (
              'Kirim Bukti Pembayaran'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}