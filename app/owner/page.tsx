// app/owner/page.tsx
import { Suspense } from "react";
import OwnerDashboardContent from "@/components/owner/OwnerDashboardContent";

export default function OwnerDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <OwnerDashboardContent />
    </Suspense>
  );
}
