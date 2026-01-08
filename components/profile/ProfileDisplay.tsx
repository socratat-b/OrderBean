import { User } from "@/types/profile";

interface ProfileDisplayProps {
  user: User;
}

export default function ProfileDisplay({ user }: ProfileDisplayProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Personal Information */}
      <div>
        <h3 className="dark:text-muted-foreground mb-3 md:mb-4 text-xs md:text-sm font-bold tracking-wider text-gray-500 uppercase">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2">
          <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 md:p-5 shadow-sm">
            <p className="dark:text-muted-foreground mb-1 text-xs font-medium text-gray-500">
              Full Name
            </p>
            <p className="dark:text-foreground text-base md:text-lg font-semibold text-gray-900 break-words">
              {user.name}
            </p>
          </div>
          <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 md:p-5 shadow-sm">
            <p className="dark:text-muted-foreground mb-1 text-xs font-medium text-gray-500">
              Email Address
            </p>
            <p className="dark:text-foreground text-base md:text-lg font-semibold text-gray-900 break-words">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="dark:text-muted-foreground mb-3 md:mb-4 text-xs md:text-sm font-bold tracking-wider text-gray-500 uppercase">
          Contact Information
        </h3>
        <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 md:p-5 shadow-sm">
          <p className="dark:text-muted-foreground mb-1 text-xs font-medium text-gray-500">
            Phone Number
          </p>
          <p className="dark:text-foreground text-base md:text-lg font-semibold text-gray-900">
            {user.phone || (
              <span className="dark:text-muted-foreground text-sm md:text-base text-gray-400 italic">
                Not provided
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <h3 className="dark:text-muted-foreground mb-3 md:mb-4 text-xs md:text-sm font-bold tracking-wider text-gray-500 uppercase">
          Delivery Address
        </h3>
        <div className="space-y-3 md:space-y-4">
          <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 md:p-5 shadow-sm">
            <p className="dark:text-muted-foreground mb-1 text-xs font-medium text-gray-500">
              Barangay
            </p>
            <p className="dark:text-foreground text-base md:text-lg font-semibold text-gray-900">
              {user.barangay || (
                <span className="dark:text-muted-foreground text-sm md:text-base text-gray-400 italic">
                  Not provided
                </span>
              )}
            </p>
          </div>
          <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 md:p-5 shadow-sm">
            <p className="dark:text-muted-foreground mb-1 text-xs font-medium text-gray-500">
              Street / Purok / Sitio
            </p>
            <p className="dark:text-foreground text-base md:text-lg font-semibold text-gray-900 break-words">
              {user.street || (
                <span className="dark:text-muted-foreground text-sm md:text-base text-gray-400 italic">
                  Not provided
                </span>
              )}
            </p>
          </div>
          {user.landmark && (
            <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 rounded-lg md:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 md:p-5 shadow-sm">
              <p className="dark:text-muted-foreground mb-1 text-xs font-medium text-gray-500">
                Landmark
              </p>
              <p className="dark:text-foreground text-base md:text-lg font-semibold text-gray-900 break-words">
                {user.landmark}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
