import { ProfileStats as ProfileStatsType } from "@/types/profile";

interface ProfileStatsProps {
  stats: ProfileStatsType | null;
  isLoading: boolean;
}

export default function ProfileStats({ stats, isLoading }: ProfileStatsProps) {
  return (
    <div className="dark:border-border dark:bg-card overflow-hidden rounded-xl md:rounded-2xl border border-gray-200 bg-white shadow-lg md:shadow-xl">
      <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-primary/20 dark:bg-primary/10 rounded-full p-1.5 md:p-2 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary h-5 w-5 md:h-6 md:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="dark:text-card-foreground text-lg md:text-2xl font-bold text-gray-900">
            Order Statistics
          </h2>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <svg
              className="text-primary h-8 w-8 md:h-10 md:w-10 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 lg:gap-6">
            <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 md:p-4 lg:p-5 text-center shadow-sm">
              <p className="dark:text-muted-foreground text-xs font-medium text-gray-500">
                Total Orders
              </p>
              <p className="text-primary mt-1.5 md:mt-2 text-2xl md:text-3xl font-bold">
                {stats.totalOrders}
              </p>
            </div>
            <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 md:p-4 lg:p-5 text-center shadow-sm">
              <p className="dark:text-muted-foreground text-xs font-medium text-gray-500">
                Completed
              </p>
              <p className="mt-1.5 md:mt-2 text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.completedOrders}
              </p>
            </div>
            <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 md:p-4 lg:p-5 text-center shadow-sm">
              <p className="dark:text-muted-foreground text-xs font-medium text-gray-500">
                Total Spent
              </p>
              <p className="dark:text-foreground mt-1.5 md:mt-2 text-xl md:text-2xl font-bold text-gray-900">
                ₱{stats.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 md:p-4 lg:p-5 text-center shadow-sm">
              <p className="dark:text-muted-foreground text-xs font-medium text-gray-500">
                Favorite
              </p>
              {stats.favoriteProduct ? (
                <>
                  <p className="dark:text-foreground mt-1.5 md:mt-2 truncate text-sm md:text-base font-bold text-gray-900">
                    {stats.favoriteProduct.name}
                  </p>
                  <p className="dark:text-muted-foreground text-xs text-gray-500">
                    {stats.favoriteProduct.orderCount}x ordered
                  </p>
                </>
              ) : (
                <p className="dark:text-muted-foreground mt-1.5 md:mt-2 text-sm text-gray-400">
                  No orders yet
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="dark:text-muted-foreground py-12 text-center text-gray-500">
            No statistics available
          </p>
        )}
      </div>
    </div>
  );
}
