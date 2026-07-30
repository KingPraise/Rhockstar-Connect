"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: '#0f172a', // slate-900
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
        },
        success: {
          iconTheme: {
            primary: '#10b981', // emerald-500
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444', // red-500
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
