"use client";

import Image from "next/image";
import { PopularProduct } from "@/types/owner";
import { formatCurrency } from "@/lib/utils";

interface PopularProductsSectionProps {
  popularProducts: PopularProduct[];
}

export default function PopularProductsSection({ popularProducts }: PopularProductsSectionProps) {
  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-md md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-card-foreground text-base font-bold md:text-lg">
          Popular Products
        </h2>
        <div className="bg-primary/10 rounded-full px-3 py-1">
          <span className="text-primary text-xs font-bold">{popularProducts.length}</span>
        </div>
      </div>
      {popularProducts.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {popularProducts.map((item, index) => (
            <div
              key={item.product.id}
              className="border-border hover:bg-muted flex items-center gap-3 rounded-lg border p-3 transition-colors md:p-4"
            >
              <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold md:h-10 md:w-10 md:text-base">
                {index + 1}
              </div>
              {item.product.imageUrl && (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  width={64}
                  height={64}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm md:h-16 md:w-16"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-card-foreground truncate text-sm font-bold md:text-base">
                  {item.product.name}
                </p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  <span className="text-primary font-semibold">
                    {item.totalQuantitySold}
                  </span>{" "}
                  sold • {item.orderCount} orders
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-card-foreground text-sm font-bold md:text-base">
                  {formatCurrency(item.product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
