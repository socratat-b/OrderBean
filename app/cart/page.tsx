// app/cart/page.tsx - Server Component wrapper
import { getCurrentUser } from "@/lib/dal";
import CartClient from "./CartClient";

export default async function CartPage() {
  // Get current user (returns null if not logged in, doesn't redirect)
  const user = await getCurrentUser();

  return <CartClient user={user} />;
}
