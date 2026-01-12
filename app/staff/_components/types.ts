// Shared types for staff dashboard components

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface Order {
  id: string;
  total: number;
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

export type OrderStatus = "ALL" | "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
