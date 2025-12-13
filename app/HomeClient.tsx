// app/HomeClient.tsx - Client Component for interactivity
"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import AboutSection from "@/components/home/AboutSection";
import LocationSection from "@/components/home/LocationSection";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
}

interface HomeClientProps {
  featuredProducts: Product[];
}

export default function HomeClient({ featuredProducts }: HomeClientProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  // TODO: Add real-time listener when implementing Phase 7
  // useEffect(() => {
  //   const subscription = supabase
  //     .channel('products')
  //     .on('postgres_changes', { event: '*', table: 'Product' }, () => {
  //       router.refresh() // Refetch server component data
  //     })
  //     .subscribe()
  //
  //   return () => subscription.unsubscribe()
  // }, [router])

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    // Navigate to cart to show the item was added
    router.push("/cart");
  };

  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturedProducts
        products={featuredProducts}
        loading={false} // No loading state - data comes from server
        onAddToCart={handleAddToCart}
      />
      <AboutSection />
      <LocationSection />
    </div>
  );
}
