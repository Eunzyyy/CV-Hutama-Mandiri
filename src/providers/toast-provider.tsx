// src/providers/toast-provider.tsx
"use client";

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        // Durasi tampil toast
        duration: 4000,
        
        // Styling untuk success toast - mirip project sebelumnya
        success: {
          style: {
            background: '#10B981', // Green-500
            color: 'white',
            fontWeight: '500',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10B981',
          },
        },
        
        // Styling untuk error toast - mirip project sebelumnya  
        error: {
          style: {
            background: '#EF4444', // Red-500
            color: 'white',
            fontWeight: '500',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#EF4444',
          },
        },
        
        // Styling untuk info toast
        loading: {
          style: {
            background: '#3B82F6', // Blue-500
            color: 'white',
            fontWeight: '500',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#3B82F6',
          },
        },
        
        // Style default untuk semua toast
        style: {
          maxWidth: '500px',
          fontSize: '14px',
        },
      }}
      
      // Konfigurasi container
      containerStyle={{
        top: 80, // Beri jarak dari navbar
      }}
      
      // Reverse order agar toast terbaru muncul di atas
      reverseOrder={false}
    />
  );
}