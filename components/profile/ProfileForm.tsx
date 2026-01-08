import { User, ProfileFormData } from "@/types/profile";
import { BARANGAYS } from "@/constants/barangays";

interface ProfileFormProps {
  user: User;
  formData: ProfileFormData;
  setFormData: (data: ProfileFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ProfileForm({
  user,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isLoading,
}: ProfileFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Personal Information Section */}
      <div>
        <h3 className="dark:text-muted-foreground mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="dark:text-foreground mb-2 block text-sm font-semibold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="dark:border-border dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:ring-2 focus:outline-none"
              placeholder="Juan Dela Cruz"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="dark:text-foreground mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              className="dark:border-border dark:bg-muted dark:text-muted-foreground block w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-500"
              disabled
            />
            <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div>
        <h3 className="dark:text-muted-foreground mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
          Contact Information
        </h3>
        <div>
          <label className="dark:text-foreground mb-2 block text-sm font-semibold text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="dark:border-border dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:ring-2 focus:outline-none"
            placeholder="09XX XXX XXXX"
            disabled={isLoading}
          />
          <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
            Format: 09XXXXXXXXX or +639XXXXXXXXX
          </p>
        </div>
      </div>

      {/* Delivery Address Section */}
      <div>
        <h3 className="dark:text-muted-foreground mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
          Delivery Address (Guinobatan, Albay)
        </h3>
        <div className="space-y-6">
          <div>
            <label className="dark:text-foreground mb-2 block text-sm font-semibold text-gray-700">
              Barangay <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.barangay}
              onChange={(e) =>
                setFormData({ ...formData, barangay: e.target.value })
              }
              className="dark:border-border dark:bg-card dark:text-foreground focus:border-primary focus:ring-primary/20 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:ring-2 focus:outline-none"
              disabled={isLoading}
            >
              <option value="">Select your barangay...</option>
              {BARANGAYS.map((brgy) => (
                <option key={brgy} value={brgy}>
                  {brgy}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="dark:text-foreground mb-2 block text-sm font-semibold text-gray-700">
              Street / Purok / Sitio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              className="dark:border-border dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:ring-2 focus:outline-none"
              placeholder="e.g., 123 Street Name, Purok 1"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="dark:text-foreground mb-2 block text-sm font-semibold text-gray-700">
              Landmark{" "}
              <span className="dark:text-muted-foreground text-xs text-gray-500">
                (Optional)
              </span>
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) =>
                setFormData({ ...formData, landmark: e.target.value })
              }
              className="dark:border-border dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:ring-2 focus:outline-none"
              placeholder="e.g., Near public market, beside church"
              disabled={isLoading}
            />
            <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
              Help us locate you easier for delivery
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary-hover text-primary-foreground flex-1 rounded-lg px-6 py-3 text-sm font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
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
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="dark:border-border dark:bg-card dark:hover:bg-muted dark:text-foreground rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
