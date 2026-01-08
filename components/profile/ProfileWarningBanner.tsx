interface ProfileWarningBannerProps {
  onCompleteClick: () => void;
}

export default function ProfileWarningBanner({
  onCompleteClick,
}: ProfileWarningBannerProps) {
  return (
    <div className="mb-8 rounded-xl border-2 border-amber-500 bg-amber-300 p-6 shadow-lg dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-amber-800 dark:text-amber-400"
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
        <div className="flex-1">
          <h3 className="text-lg font-bold text-black dark:text-amber-700">
            Complete Your Profile
          </h3>
          <p className="mt-1 text-sm text-black dark:text-amber-300">
            Add your contact and delivery information to enable faster checkout
            and delivery tracking.
          </p>
        </div>
        <button
          onClick={onCompleteClick}
          className="flex-shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-gray-800 dark:bg-amber-700 dark:hover:bg-amber-800"
        >
          Complete Now
        </button>
      </div>
    </div>
  );
}
