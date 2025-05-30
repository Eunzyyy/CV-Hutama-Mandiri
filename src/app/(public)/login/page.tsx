// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("Email atau password salah");
        } else {
          toast.error(result.error);
        }
      } else if (result?.ok) {
        toast.success("Login berhasil!");
        
        try {
          // Ambil session untuk mendapatkan role user
          const session = await getSession();
          
          if (session?.user?.role) {
            const role = session.user.role.toLowerCase();
            
            // Notifikasi redirect berdasarkan role
            switch (role) {
              case 'admin':
                toast.success("Mengalihkan ke dashboard admin...");
                break;
              case 'owner':
                toast.success("Mengalihkan ke dashboard owner...");
                break;
              case 'finance':
                toast.success("Mengalihkan ke dashboard finance...");
                break;
              case 'customer':
                toast.success("Mengalihkan ke dashboard customer...");
                break;
              default:
                toast.success("Mengalihkan ke dashboard...");
            }
            
            // PERBAIKAN: Redirect langsung tanpa delay yang terlalu lama
            setTimeout(() => {
              // Pastikan redirect ke path yang benar
              window.location.href = `/${role}`;
            }, 500); // Kurangi delay ke 500ms
            
          } else {
            // Fallback jika tidak bisa mendapatkan role
            toast.error("Tidak dapat mengambil data sesi");
            window.location.href = "/";
          }
        } catch (sessionError) {
          console.error("Error getting session:", sessionError);
          toast.error("Terjadi kesalahan saat mengambil data sesi");
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="relative h-16 w-16 mx-auto">
              <Image
                src="/images/logo.png"
                alt="CV Hutama Mandiri Indotech"
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Login ke Akun Anda
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Silakan login untuk mengakses dashboard dan layanan
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                placeholder="nama@contoh.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Masukkan password Anda"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Ingat saya
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Lupa password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  <span>Memproses...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-6">
          <div className="text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}