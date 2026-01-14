// types/owner.ts - Owner dashboard related types

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
}

export interface PopularProduct {
  product: Product;
  totalQuantitySold: number;
  orderCount: number;
}

export interface OrderItem {
  product: {
    name: string;
  };
  quantity: number;
}

export interface RecentOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  ordersChange?: number;
  revenueChange?: number;
  ordersByStatus: OrdersByStatus[];
  popularProducts: PopularProduct[];
  recentOrders: RecentOrder[];
  revenueByDay?: RevenueByDay[];
}
