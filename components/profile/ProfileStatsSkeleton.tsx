export default function ProfileStatsSkeleton() {
  return (
    <div className="dark:border-border dark:bg-card overflow-hidden rounded-xl md:rounded-2xl border border-gray-200 bg-white shadow-lg md:shadow-xl animate-pulse">
      <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-9 w-9 md:h-10 md:w-10 flex-shrink-0"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-6 w-40 rounded"></div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 md:p-4 lg:p-5 text-center shadow-sm"
            >
              <div className="bg-gray-200 dark:bg-gray-700 h-4 w-20 mx-auto rounded mb-2"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-8 w-16 mx-auto rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
