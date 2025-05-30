//src/app/finance/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Moon,
  Sun,
  Monitor,
  CreditCard,
  DollarSign,
  FileText
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function FinanceSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    paymentUpdates: true,
    reportReminders: true,
    systemAlerts: true,
    overduePayments: true,
  });

  const [financeSettings, setFinanceSettings] = useState({
    autoApproveLimit: 1000000,
    requireApprovalAbove: 5000000,
    defaultPaymentTerms: 30,
    enableAutoReconciliation: true,
    showAdvancedReports: true,
    enableExportSchedule: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    showEmail: false,
    showPhone: false,
    allowMessages: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMounted(true);
    if (session) {
      loadSettings();
    }
  }, [session]);

  const loadSettings = async () => {
    try {
      const savedNotifications = localStorage.getItem("finance-notifications");
      const savedFinanceSettings = localStorage.getItem("finance-settings");
      const savedPrivacy = localStorage.getItem("finance-privacy");

      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedFinanceSettings) {
        setFinanceSettings(JSON.parse(savedFinanceSettings));
      }
      if (savedPrivacy) {
        setPrivacy(JSON.parse(savedPrivacy));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveNotificationSettings = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem("finance-notifications", JSON.stringify(notifications));
      toast.success("Pengaturan notifikasi disimpan");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFinanceSettings = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem("finance-settings", JSON.stringify(financeSettings));
      toast.success("Pengaturan keuangan disimpan");
    } catch (error) {
      console.error("Error saving finance settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem("finance-privacy", JSON.stringify(privacy));
      toast.success("Pengaturan privasi disimpan");
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Konfirmasi password tidak sesuai");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password berhasil diubah");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengubah password");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Gagal mengubah password");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Silakan login untuk mengakses pengaturan
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

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Finance</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Kelola preferensi dan konfigurasi sistem keuangan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <nav className="space-y-2">
              <a href="#finance" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <DollarSign size={18} className="mr-3 text-blue-600" />
                Keuangan
              </a>
              <a href="#appearance" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Palette size={18} className="mr-3 text-purple-600" />
                Tampilan
              </a>
              <a href="#notifications" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Bell size={18} className="mr-3 text-green-600" />
                Notifikasi
              </a>
              <a href="#privacy" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Shield size={18} className="mr-3 text-yellow-600" />
                Privasi
              </a>
              <a href="#security" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Lock size={18} className="mr-3 text-red-600" />
                Keamanan
              </a>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Finance Settings */}
          <div id="finance" className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold flex items-center">
                <DollarSign size={20} className="mr-2 text-blue-600" />
                Pengaturan Keuangan
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Konfigurasi sistem pembayaran dan persetujuan
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auto Approve Limit
                </label>
                <input
                  type="number"
                  value={financeSettings.autoApproveLimit}
                  onChange={(e) => setFinanceSettings({
                    ...financeSettings,
                    autoApproveLimit: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Pembayaran dibawah {formatCurrency(financeSettings.autoApproveLimit)} akan disetujui otomatis
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Require Approval Above
                </label>
                <input
                  type="number"
                  value={financeSettings.requireApprovalAbove}
                  onChange={(e) => setFinanceSettings({
                    ...financeSettings,
                    requireApprovalAbove: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Pembayaran diatas {formatCurrency(financeSettings.requireApprovalAbove)} memerlukan persetujuan manual
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Payment Terms (Days)
                </label>
                <select
                  value={financeSettings.defaultPaymentTerms}
                  onChange={(e) => setFinanceSettings({
                    ...financeSettings,
                    defaultPaymentTerms: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  <option value={7}>7 Hari</option>
                  <option value={14}>14 Hari</option>
                  <option value={30}>30 Hari</option>
                  <option value={60}>60 Hari</option>
                  <option value={90}>90 Hari</option>
                </select>
              </div>

              {[
                { key: "enableAutoReconciliation", label: "Auto Reconciliation", desc: "Otomatis mencocokkan pembayaran dengan invoice" },
                { key: "showAdvancedReports", label: "Advanced Reports", desc: "Tampilkan laporan keuangan lanjutan" },
                { key: "enableExportSchedule", label: "Scheduled Export", desc: "Ekspor data otomatis setiap periode" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={financeSettings[item.key as keyof typeof financeSettings] as boolean}
                      onChange={(e) => setFinanceSettings({
                        ...financeSettings,
                        [item.key]: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={saveFinanceSettings}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div id="appearance" className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold flex items-center">
                <Palette size={20} className="mr-2 text-purple-600" />
                Tampilan
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Sesuaikan tema dan bahasa aplikasi
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-3 border rounded-lg text-center transition ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Sun size={20} className="mx-auto mb-2" />
                    <span className="text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-3 border rounded-lg text-center transition ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Moon size={20} className="mx-auto mb-2" />
                    <span className="text-sm">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-3 border rounded-lg text-center transition ${
                      theme === "system"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Monitor size={20} className="mx-auto mb-2" />
                    <span className="text-sm">System</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Globe size={16} className="inline mr-2" />
                  Bahasa
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700">
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div id="notifications" className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold flex items-center">
                <Bell size={20} className="mr-2 text-green-600" />
                Notifikasi
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Atur preferensi notifikasi keuangan
              </p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: "email", label: "Email", icon: Mail, desc: "Terima notifikasi via email" },
                { key: "sms", label: "SMS", icon: Phone, desc: "Terima notifikasi via SMS" },
                { key: "paymentUpdates", label: "Payment Updates", icon: CreditCard, desc: "Notifikasi perubahan status pembayaran" },
                { key: "reportReminders", label: "Report Reminders", icon: FileText, desc: "Pengingat laporan keuangan" },
                { key: "systemAlerts", label: "System Alerts", icon: Bell, desc: "Peringatan sistem keuangan" },
                { key: "overduePayments", label: "Overdue Payments", icon: Bell, desc: "Notifikasi pembayaran terlambat" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <item.icon size={18} className="mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={(e) => setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={saveNotificationSettings}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings - sama seperti customer tapi lebih terbatas */}
          <div id="privacy" className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold flex items-center">
                <Shield size={20} className="mr-2 text-yellow-600" />
                Privasi
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Kontrol siapa yang dapat melihat informasi Anda
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visibilitas Profil
                </label>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  <option value="private">Privat</option>
                  <option value="team">Tim Finance</option>
                  <option value="company">Perusahaan</option>
                </select>
              </div>

              {[
                { key: "showEmail", label: "Tampilkan Email", desc: "Email Anda akan terlihat di profil" },
                { key: "showPhone", label: "Tampilkan Telepon", desc: "Nomor telepon Anda akan terlihat di profil" },
                { key: "allowMessages", label: "Izinkan Pesan", desc: "Tim lain dapat mengirim pesan kepada Anda" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy[item.key as keyof typeof privacy] as boolean}
                      onChange={(e) => setPrivacy({
                        ...privacy,
                        [item.key]: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={savePrivacySettings}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings - sama seperti customer */}
          <div id="security" className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold flex items-center">
                <Lock size={20} className="mr-2 text-red-600" />
                Keamanan
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Kelola password dan keamanan akun
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : (
                      <Lock size={16} className="mr-2" />
                    )}
                    Ubah Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}