"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStaffOrdersSSE } from "@/hooks/useStaffOrdersSSE";
import { SearchBar } from "./SearchBar";
import { StatusFilters } from "./StatusFilters";
import { OrderCard } from "./OrderCard";
import { NotificationButton } from "./NotificationButton";
import type { Order, OrderStatus } from "./types";

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

const STATUS_FILTERS: OrderStatus[] = ["ALL", "PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

interface StaffDashboardClientProps {
  initialOrders: Order[];
}

export default function StaffDashboardClient({ initialOrders }: StaffDashboardClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchFilteredOrders, setSearchFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.error("Failed to play notification sound:", err);
    }
  }, []);

  const showNotification = useCallback(
    (order: Order) => {
      if (!notificationsEnabled || Notification.permission !== "granted") return;

      const notification = new Notification("New Order Received!", {
        body: `Order from ${order.user.name} - ₱${order.total.toFixed(2)}`,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: order.id,
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    },
    [notificationsEnabled]
  );

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/staff/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }, []);

  const handleOrderCreated = useCallback(() => {
    console.log("[Staff] Order created event");
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderUpdated = useCallback(() => {
    console.log("[Staff] Order updated event");
    fetchOrders();
  }, [fetchOrders]);

  const { isConnected } = useStaffOrdersSSE(handleOrderCreated, handleOrderUpdated);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      return;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`/api/staff/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders((prev) => prev.map((order) => (order.id === orderId ? data.order : order)));
      } else {
        alert("Failed to update order");
      }
    } catch (err) {
      alert("Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Detect new orders and trigger notifications
  useEffect(() => {
    if (lastOrderCount === 0) {
      setLastOrderCount(orders.length);
      return;
    }

    const pendingOrders = orders.filter((o) => o.status === "PENDING");
    if (orders.length > lastOrderCount && pendingOrders.length > 0) {
      const newCount = orders.length - lastOrderCount;
      setNewOrdersCount((prev) => prev + newCount);

      const newestOrder = pendingOrders[0];
      playNotificationSound();
      showNotification(newestOrder);
    }

    setLastOrderCount(orders.length);
  }, [orders, lastOrderCount, playNotificationSound, showNotification]);

  // Apply search and status filtering
  useEffect(() => {
    let searchFiltered = orders;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      searchFiltered = orders.filter((order) => {
        if (order.user.name.toLowerCase().includes(query)) return true;
        if (order.user.email.toLowerCase().includes(query)) return true;
        if (order.id.toLowerCase().includes(query)) return true;
        const hasMatchingProduct = order.orderItems.some((item) =>
          item.product.name.toLowerCase().includes(query)
        );
        if (hasMatchingProduct) return true;
        return false;
      });
    }

    setSearchFilteredOrders(searchFiltered);

    let finalFiltered = searchFiltered;
    if (selectedStatus !== "ALL") {
      finalFiltered = searchFiltered.filter((order) => order.status === selectedStatus);
    }

    setFilteredOrders(finalFiltered);
  }, [selectedStatus, orders, searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() !== "" && newOrdersCount > 0) {
      setNewOrdersCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customer Orders</h1>
              <p className="mt-2 text-base md:text-sm text-muted-foreground">
                Manage customer orders • <span className="text-lg md:text-base font-bold text-foreground">{orders.length}</span> total orders
                {newOrdersCount > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-2 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground"
                  >
                    {newOrdersCount} new
                  </motion.span>
                )}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                <span className="text-xs text-muted-foreground">{isConnected ? "Live updates" : "Connecting..."}</span>
              </div>
              <NotificationButton notificationsEnabled={notificationsEnabled} onToggle={requestNotificationPermission} />
            </div>
          </div>

          <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <StatusFilters
            statusFilters={STATUS_FILTERS}
            selectedStatus={selectedStatus}
            searchFilteredOrders={searchFilteredOrders}
            onStatusChange={setSelectedStatus}
          />
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card py-12"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-16 w-16 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            <p className="mt-4 text-lg font-semibold text-card-foreground">
              {searchQuery ? "No matching orders found" : `No ${selectedStatus !== "ALL" ? selectedStatus.toLowerCase() : ""} orders`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? `No orders match "${searchQuery}". Try a different search term.` : selectedStatus === "ALL" ? "No orders have been placed yet." : `There are no ${selectedStatus.toLowerCase()} orders at the moment.`}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">
                Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  variants={cardItem}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  <OrderCard order={order} isUpdating={updatingOrderId === order.id} onUpdateStatus={updateOrderStatus} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
