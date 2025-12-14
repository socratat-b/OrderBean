// app/owner/products/page.tsx
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
  createdAt: string;
  updatedAt: string;
}

export default function ProductsManagement() {
  // Check if we have cached data
  const getCachedProducts = () => {
    if (typeof window === 'undefined') return null;
    const cached = sessionStorage.getItem('owner_products');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  };

  const cachedProducts = getCachedProducts();

  const [products, setProducts] = useState<Product[]>(cachedProducts || []);
  const [initialLoading, setInitialLoading] = useState(!cachedProducts);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    available: true,
  });

  useEffect(() => {
    // Only show initial loading if we don't have cached data
    fetchProducts(!cachedProducts);
  }, []);

  async function fetchProducts(isInitial = false) {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch("/api/owner/products", {
        cache: "no-store", // Ensure fresh data but handle loading better
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Owner role required.");
        }
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products);

      // Cache the data in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('owner_products', JSON.stringify(data.products));
      }

      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }

  function openAddModal() {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      available: true,
    });
    setImagePreview("");
    setShowModal(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl || "",
      available: product.available,
    });
    setImagePreview(product.imageUrl || "");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      available: true,
    });
    setImagePreview("");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload to API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();

      // Set the image URL and preview
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      setImagePreview(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage() {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setImagePreview("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingProduct
        ? `/api/owner/products/${editingProduct.id}`
        : "/api/owner/products";

      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          category: formData.category,
          imageUrl: formData.imageUrl || undefined,
          available: formData.available,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save product");
      }

      // Refresh products list
      await fetchProducts();
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  }

  function openDeleteModal(product: Product) {
    setProductToDelete(product);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setProductToDelete(null);
  }

  async function confirmDelete() {
    if (!productToDelete) return;

    try {
      setDeletingId(productToDelete.id);
      const response = await fetch(`/api/owner/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete product");
      }

      // Refresh products list
      await fetchProducts();
      closeDeleteModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleAvailability(product: Product) {
    // Optimistic update - update UI immediately
    const newAvailability = !product.available;
    setProducts(
      products.map((p) =>
        p.id === product.id ? { ...p, available: newAvailability } : p
      )
    );

    try {
      const response = await fetch(`/api/owner/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          available: newAvailability,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }
    } catch (err) {
      // Revert on error
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, available: product.available } : p
        )
      );
      alert(err instanceof Error ? err.message : "Failed to update product");
    }
  }

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-error font-semibold">Error: {error}</p>
          <button
            onClick={() => fetchProducts(true)}
            className="mt-4 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          {/* Mobile Header */}
          <div className="flex flex-col gap-4 md:hidden">
            <Link
              href="/owner"
              className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors active:scale-95"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">Products</h1>
                  {refreshing && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary"></div>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {products.length} total
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div>
              <Link
                href="/owner"
                className="mb-2 inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
                {refreshing && (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"></div>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {products.length} products total
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card py-16 px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            <p className="mt-4 text-base md:text-lg font-bold text-card-foreground">No products yet</p>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              Get started by adding your first product
            </p>
            <button
              onClick={openAddModal}
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              + Add Product
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-40 md:h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 md:h-48 w-full items-center justify-center bg-muted">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                    </div>
                  )}
                  {/* Availability Badge */}
                  {!product.available && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-block rounded-full bg-error px-3 py-1 text-xs font-bold text-white shadow-md">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 md:p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-card-foreground text-sm md:text-base truncate">{product.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <span className="text-base md:text-lg font-black text-primary shrink-0">
                      ₱{product.price.toFixed(2)}
                    </span>
                  </div>

                  {product.description && (
                    <p className="mb-3 line-clamp-2 text-xs md:text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  )}

                  {/* Availability Toggle */}
                  <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-card-foreground">
                        Stock
                      </span>
                      <span className={`text-xs font-semibold ${product.available ? 'text-green-600 dark:text-green-500' : 'text-error'}`}>
                        {product.available ? 'In Stock' : 'Out'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleAvailability(product)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        product.available ? "bg-green-600 dark:bg-green-500" : "bg-muted-foreground"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          product.available ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 rounded-xl border border-border bg-card px-3 md:px-4 py-2.5 text-xs md:text-sm font-bold text-card-foreground hover:bg-muted active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(product)}
                      disabled={deletingId === product.id}
                      className="flex-1 rounded-xl border border-error bg-card px-3 md:px-4 py-2.5 text-xs md:text-sm font-bold text-error hover:bg-error hover:text-white disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-50 p-0 md:p-4">
          <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl rounded-t-2xl md:rounded-xl border-t-2 md:border-2 border-border bg-card shadow-xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-4 md:px-6 lg:px-8 py-4 md:py-5 flex items-center justify-between z-10">
              <h2 className="text-xl md:text-2xl font-bold text-card-foreground">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 hover:bg-muted transition-colors active:scale-95"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
              {/* Name and Category - Two columns on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-card-foreground">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-card text-card-foreground px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="e.g., Espresso"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-card-foreground">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-card text-card-foreground px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="e.g., Coffee, Pastry"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="md:w-1/2 md:pr-3">
                <label className="mb-2 block text-sm font-bold text-card-foreground">
                  Price (₱) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-card text-card-foreground px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-bold text-card-foreground">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-card text-card-foreground px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  placeholder="Product description..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-bold text-card-foreground">
                  Product Image
                </label>

                {imagePreview ? (
                  /* Image Preview */
                  <div className="relative rounded-xl border-2 border-border bg-muted overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 rounded-full bg-error p-2 text-white shadow-lg hover:bg-error/90 active:scale-95 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* Upload Area */
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted hover:bg-muted/70 transition-colors py-8 px-4 cursor-pointer ${
                        uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {uploadingImage ? (
                        <svg className="w-12 h-12 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          <svg className="w-12 h-12 text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-semibold text-card-foreground mb-1">
                            Click to upload image
                          </p>
                          <p className="text-xs text-muted-foreground text-center">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                )}

                {/* Optional: Image URL fallback */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter image URL:");
                      if (url) {
                        setFormData({ ...formData, imageUrl: url });
                        setImagePreview(url);
                      }
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Or use image URL instead
                  </button>
                </div>
              </div>

              {/* Available */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
                <label htmlFor="available" className="text-sm font-bold text-card-foreground">
                  Available for purchase
                </label>
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Buttons */}
              <div className="sticky bottom-0 bg-card pt-4 pb-2 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 border-t border-border mt-6">
                <div className="flex gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="flex-1 rounded-xl border border-border bg-card px-4 py-3 md:py-3.5 text-sm font-bold text-card-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 md:py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-2xl border-2 border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Warning Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10 mb-4">
              <svg
                className="h-10 w-10 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-center text-xl md:text-2xl font-bold text-card-foreground mb-2">
              Delete Product?
            </h3>

            {/* Description */}
            <p className="text-center text-sm md:text-base text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold text-card-foreground">
                "{productToDelete.name}"
              </span>
              ? This action cannot be undone.
            </p>

            {/* Product Preview */}
            <div className="mb-6 rounded-xl border border-border bg-muted p-3 flex items-center gap-3">
              {productToDelete.imageUrl ? (
                <img
                  src={productToDelete.imageUrl}
                  alt={productToDelete.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-card">
                  <svg
                    className="h-8 w-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-card-foreground truncate">
                  {productToDelete.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  ₱{productToDelete.price.toFixed(2)} • {productToDelete.category}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingId === productToDelete.id}
                className="flex-1 rounded-xl border-2 border-border bg-card px-4 py-3 text-sm font-bold text-card-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === productToDelete.id}
                className="flex-1 rounded-xl bg-error px-4 py-3 text-sm font-bold text-white hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {deletingId === productToDelete.id ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
