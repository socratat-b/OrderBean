"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          // Get first 3 products as featured
          setFeaturedProducts(data.products.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-32 md:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 mb-6">
                ☕ Premium Coffee Experience
              </div>
              <h1 className="text-5xl font-black tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                Your Daily Dose of{" "}
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Happiness
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed md:text-xl">
                Freshly brewed coffee, delicious pastries, and a warm atmosphere. Order ahead and skip the line!
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center rounded-xl bg-black px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Order Now
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="ml-2 h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="#menu"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-gray-900 bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all hover:bg-gray-50"
                >
                  Explore Menu
                </Link>
              </div>
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-gray-200 pt-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">4.9</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">15+</div>
                  <div className="text-sm text-gray-600">Menu Items</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 h-72 w-72 rounded-full bg-amber-200 opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-8 -right-4 h-72 w-72 rounded-full bg-orange-200 opacity-20 blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop"
                alt="Coffee cup"
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section id="menu" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
          {/* Section Header */}
          <div className="text-center">
            <div className="inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 mb-4">
              Our Menu
            </div>
            <h2 className="text-4xl font-black text-gray-900 md:text-5xl">
              Featured Favorites
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Handcrafted with love, served with a smile. Discover our most popular items.
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-200 p-6">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  {product.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-48 w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 mb-2">
                    {product.category}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ₱{product.price.toFixed(2)}
                    </span>
                    <Link
                      href="/menu"
                      className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                    >
                      Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-900 bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all hover:bg-gray-50"
            >
              View Full Menu
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="scroll-mt-20 bg-gradient-to-br from-gray-50 to-amber-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop"
                  alt="Coffee shop interior"
                  className="rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 rounded-2xl bg-white p-6 shadow-xl">
                  <div className="text-4xl font-black text-gray-900">10+</div>
                  <div className="text-sm text-gray-600">Years of Excellence</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 mb-6">
                About OrderBean
              </div>
              <h2 className="text-4xl font-black text-gray-900 md:text-5xl">
                Brewing Excellence Since 2014
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                At OrderBean, we believe that great coffee starts with great beans. We source our coffee from ethical, sustainable farms around the world and roast them fresh daily in our shop.
              </p>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Our passionate baristas are trained to craft the perfect cup every time, whether you prefer a classic espresso or a creative seasonal specialty.
              </p>

              {/* Features */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-amber-900">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Premium Quality Beans</h3>
                    <p className="text-gray-600">Ethically sourced from the world's finest coffee regions</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-amber-900">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Freshly Roasted Daily</h3>
                    <p className="text-gray-600">Roasted in small batches for maximum freshness and flavor</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-amber-900">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Expert Baristas</h3>
                    <p className="text-gray-600">Trained professionals dedicated to crafting your perfect cup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 mb-4">
              Visit Us
            </div>
            <h2 className="text-4xl font-black text-gray-900 md:text-5xl">
              Find Us Here
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Come visit our cozy coffee shop in the heart of Manila. We can't wait to serve you!
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Map Placeholder */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 h-96">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-16 w-16 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <p className="mt-4 text-sm text-gray-600">Map View</p>
                </div>
              </div>
              {/* You can integrate Google Maps or Mapbox here */}
            </div>

            {/* Contact Information */}
            <div className="flex flex-col justify-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7 text-amber-900">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Address</h3>
                    <p className="mt-1 text-gray-600">123 Coffee Street<br />Makati City, Manila 1200<br />Philippines</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7 text-amber-900">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Opening Hours</h3>
                    <p className="mt-1 text-gray-600">
                      Monday - Friday: 7:00 AM - 8:00 PM<br />
                      Saturday - Sunday: 8:00 AM - 9:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7 text-amber-900">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Contact</h3>
                    <p className="mt-1 text-gray-600">
                      Phone: <a href="tel:+639123456789" className="hover:text-amber-600 transition-colors">+63 912 345 6789</a><br />
                      Email: <a href="mailto:hello@orderbean.com" className="hover:text-amber-600 transition-colors">hello@orderbean.com</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <Link
                  href="/menu"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl"
                >
                  Order for Pickup
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
