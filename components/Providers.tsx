"use client";

import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import Toast from "@/components/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          {children}
          <Toast />
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
