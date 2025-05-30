// src/app/admin/users/view/[id]/page.tsx - BUAT FILE INI JUGA
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Shield,
  ShoppingCart,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  role: string;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
  };
}

export default function ViewUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Pengguna tidak ditemukan");
        }
        throw new Error("Gagal memuat data pengguna");
      }
      
      const userData = await response.json();
      setUser(userData);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast.error(error.message || "Gagal memuat data pengguna");
      router.push("/admin/users");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Admin" },
      OWNER: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", label: "Owner" },
      FINANCE: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", label: "Finance" },
      CUSTOMER: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Customer" },
    }[role] || { color: "bg-gray-100 text-gray-800", label: role };

    return (
      <span className={`px-3 py-1 inline-flex items-center text-sm font-semibold rounded-full ${roleConfig.color}`}>
        <Shield size={14} className="mr-1" />
        {roleConfig.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Pengguna tidak ditemukan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Pengguna dengan ID "{params.id}" tidak ditemukan atau telah dihapus.
        </p>
        <Link
          href="/admin/users"
          className="inline-flex items-center px-4 py-2 bg-primary-600 rounded-md text-white hover:bg-primary-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Daftar Pengguna
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
            href="/admin/users"
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detail Pengguna</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Informasi lengkap pengguna: {user.name}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/admin/users/edit/${user.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Informasi Dasar</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <User size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nama Lengkap</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nomor Telepon</p>
                  <p className="font-medium">{user.phone || user.phoneNumber || "-"}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Shield size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                  <div className="mt-1">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>
            </div>
            
            {user.address && (
              <div className="mt-6 flex items-start">
                <MapPin size={16} className="text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Alamat</p>
                  <p className="font-medium">{user.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Account Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Status Akun</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status Email</p>
                {user.emailVerified ? (
                  <span className="px-3 py-1 inline-flex items-center text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle size={14} className="mr-1" />
                    Terverifikasi
                  </span>
                ) : (
                  <span className="px-3 py-1 inline-flex items-center text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <XCircle size={14} className="mr-1" />
                    Belum Verifikasi
                  </span>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Pesanan</p>
                <span className="px-3 py-1 inline-flex items-center text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  <ShoppingCart size={14} className="mr-1" />
                  {user._count?.orders || 0} pesanan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Statistik</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">ID Pengguna</span>
                <span className="font-medium">{user.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Pesanan</span>
                <span className="font-medium">{user._count?.orders || 0}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bergabung</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Terakhir Update</p>
                  <p className="font-medium">
                    {new Date(user.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
            <div className="space-y-3">
              <Link
                href={`/admin/users/edit/${user.id}`}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Pengguna
              </Link>
              <Link
                href={`/admin/orders?user=${user.id}`}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Lihat Pesanan ({user._count?.orders || 0})
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}