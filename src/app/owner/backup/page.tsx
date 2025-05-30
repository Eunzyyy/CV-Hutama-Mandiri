// src/app/owner/backup/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Calendar,
  File,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";

interface BackupItem {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  type: string;
  status: string;
}

export default function OwnerBackupPage() {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupType, setBackupType] = useState("full");

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/owner/backup');
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      } else {
        throw new Error('Failed to fetch backups');
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Gagal memuat daftar backup');
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const response = await fetch('/api/owner/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: backupType })
      });

      if (response.ok) {
        toast.success('Backup sedang dibuat. Silakan tunggu beberapa menit.');
        fetchBackups();
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Gagal membuat backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = async (backupId: string, filename: string) => {
    try {
      const response = await fetch(`/api/owner/backup/${backupId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Backup berhasil didownload');
      } else {
        throw new Error('Failed to download backup');
      }
    } catch (error) {
      toast.error('Gagal download backup');
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus backup ini?')) return;

    try {
      const response = await fetch(`/api/owner/backup/${backupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Backup berhasil dihapus');
        fetchBackups();
      } else {
        throw new Error('Failed to delete backup');
      }
    } catch (error) {
      toast.error('Gagal menghapus backup');
    }
  };

  const exportData = async (exportType: string) => {
    try {
      const response = await fetch(`/api/owner/export?type=${exportType}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${exportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Export ${exportType} berhasil didownload`);
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      toast.error(`Gagal export ${exportType}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Completed" },
      processing: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Processing" },
      failed: { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "Failed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Backup & Export</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Kelola backup database dan export data sistem
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Backup */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Database size={20} className="mr-2 text-blue-600" />
            Create Backup
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Backup Type</label>
              <select
                value={backupType}
                onChange={(e) => setBackupType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">Full Database</option>
                <option value="data_only">Data Only</option>
                <option value="structure_only">Structure Only</option>
              </select>
            </div>
            
            <button
              onClick={createBackup}
              disabled={isCreatingBackup}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center justify-center"
            >
              {isCreatingBackup ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Shield size={16} className="mr-2" />
                  Create Backup
                </>
              )}
            </button>
          </div>
        </div>

        {/* Export Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Download size={20} className="mr-2 text-green-600" />
            Export Data
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => exportData('users')}
              className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 py-2 px-4 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition"
            >
              Export Users Data
            </button>
            <button
              onClick={() => exportData('orders')}
              className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
            >
              Export Orders Data
            </button>
            <button
              onClick={() => exportData('products')}
              className="w-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 py-2 px-4 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
            >
              Export Products Data
            </button>
            <button
              onClick={() => exportData('payments')}
              className="w-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 py-2 px-4 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 transition"
            >
              Export Payments Data
            </button>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Backup History</h3>
          <button
            onClick={fetchBackups}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <File size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {backup.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {backup.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(backup.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(backup.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {backup.status === 'completed' && (
                          <button
                            onClick={() => downloadBackup(backup.id, backup.name)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Database size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {backups.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Database size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Backups Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first backup to secure your data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}