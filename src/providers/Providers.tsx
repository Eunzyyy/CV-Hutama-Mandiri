// src/providers/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
        storageKey="theme"
      >
        {/* Toast Provider */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            success: {
              style: {
                background: '#10B981',
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
            error: {
              style: {
                background: '#EF4444',
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
            style: {
              maxWidth: '500px',
              fontSize: '14px',
            },
          }}
          containerStyle={{
            top: 80,
          }}
          reverseOrder={false}
        />
        
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}