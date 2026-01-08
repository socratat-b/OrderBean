interface ProfileWarningBannerProps {
  onCompleteClick: () => void;
}

export default function ProfileWarningBanner({
  onCompleteClick,
}: ProfileWarningBannerProps) {
  return (
    <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl border-2 border-amber-500 bg-amber-300 p-4 md:p-6 shadow-lg dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
        <div className="flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-7 md:w-7 text-amber-800 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-bold text-black dark:text-amber-700">
            Complete Your Profile
          </h3>
          <p className="mt-1 text-xs md:text-sm text-black/90 dark:text-amber-300 leading-relaxed">
            Add your contact and delivery information to enable faster checkout
            and delivery tracking.
          </p>
        </div>
        <button
          onClick={onCompleteClick}
          className="w-full sm:w-auto flex-shrink-0 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 hover:bg-gray-800 dark:bg-amber-700 dark:hover:bg-amber-800"
        >
          Complete Now
        </button>
      </div>
    </div>
  );
}
