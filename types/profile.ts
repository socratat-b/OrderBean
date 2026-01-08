export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  barangay?: string | null;
  street?: string | null;
  landmark?: string | null;
  role: string;
}

export interface ProfileStats {
  totalOrders: number;
  totalSpent: number;
  completedOrders: number;
  favoriteProduct: {
    name: string;
    orderCount: number;
  } | null;
}

export interface ProfileFormData {
  name: string;
  phone: string;
  barangay: string;
  street: string;
  landmark: string;
}
