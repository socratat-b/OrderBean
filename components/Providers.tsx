"use client";

import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Toast from "@/components/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <NotificationProvider>
          <CartProvider>
            {children}
            <Toast />
          </CartProvider>
        </NotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
