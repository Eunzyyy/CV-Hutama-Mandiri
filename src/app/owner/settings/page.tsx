// src/app/owner/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Database,
  Mail,
  Bell,
  Shield,
  Globe,
  Palette,
  Server
} from "lucide-react";
import { toast } from "react-hot-toast";

interface SystemSettings {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  tax_rate: string;
  currency: string;
  timezone: string;
  email_notifications: string;
  order_auto_status: string;
  maintenance_mode: string;
}

export default function OwnerSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/owner/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal memuat pengaturan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        [key]: value
      });
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/owner/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Pengaturan berhasil disimpan');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola pengaturan sistem dan konfigurasi bisnis
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Save size={16} className="mr-2" />
          )}
          Simpan Pengaturan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Globe size={20} className="mr-2 text-blue-600" />
            Informasi Perusahaan
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Perusahaan</label>
              <input
                type="text"
                value={settings?.company_name || ''}
                onChange={(e) => updateSetting('company_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alamat</label>
              <textarea
                value={settings?.company_address || ''}
                onChange={(e) => updateSetting('company_address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nomor Telepon</label>
              <input
                type="text"
                value={settings?.company_phone || ''}
                onChange={(e) => updateSetting('company_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={settings?.company_email || ''}
                onChange={(e) => updateSetting('company_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Settings size={20} className="mr-2 text-green-600" />
            Pengaturan Bisnis
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={settings?.tax_rate || ''}
                onChange={(e) => updateSetting('tax_rate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                value={settings?.currency || ''}
                onChange={(e) => updateSetting('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="IDR">Indonesian Rupiah (IDR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                value={settings?.timezone || ''}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Jakarta">WIB - Jakarta</option>
                <option value="Asia/Makassar">WITA - Makassar</option>
                <option value="Asia/Jayapura">WIT - Jayapura</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Server size={20} className="mr-2 text-purple-600" />
            Konfigurasi Sistem
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Notifications</label>
              <select
                value={settings?.email_notifications || ''}
                onChange={(e) => updateSetting('email_notifications', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Auto Order Status Update</label>
              <select
                value={settings?.order_auto_status || ''}
                onChange={(e) => updateSetting('order_auto_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maintenance Mode</label>
              <select
                value={settings?.maintenance_mode || ''}
                onChange={(e) => updateSetting('maintenance_mode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="off">Off</option>
                <option value="on">On</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Mode maintenance akan menonaktifkan akses customer
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Shield size={20} className="mr-2 text-orange-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
              Backup Database
            </button>
            <button className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 py-2 px-4 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition">
              Clear Cache
            </button>
            <button className="w-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 py-2 px-4 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 transition">
              System Health Check
            </button>
            <button className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 py-2 px-4 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition">
              Export System Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}