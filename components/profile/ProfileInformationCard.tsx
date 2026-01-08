import { User, ProfileFormData } from "@/types/profile";
import ProfileForm from "./ProfileForm";
import ProfileDisplay from "./ProfileDisplay";

interface ProfileInformationCardProps {
  user: User;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  formData: ProfileFormData;
  setFormData: (data: ProfileFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ProfileInformationCard({
  user,
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isLoading,
}: ProfileInformationCardProps) {
  return (
    <div className="dark:border-border dark:bg-card mb-6 md:mb-8 overflow-hidden rounded-xl md:rounded-2xl border border-gray-200 bg-white shadow-lg md:shadow-xl">
      {/* Header */}
      <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="dark:text-card-foreground text-lg md:text-2xl font-bold text-gray-900 truncate">
              Profile Information
            </h2>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-1.5 md:gap-2 rounded-lg px-3 py-2 md:px-4 text-xs md:text-sm font-semibold shadow-md transition-all active:scale-95 md:hover:scale-105 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 md:h-4 md:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="hidden sm:inline">Edit Profile</span>
              <span className="sm:hidden">Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 lg:p-8">
        {isEditing ? (
          <ProfileForm
            user={user}
            formData={formData}
            setFormData={setFormData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        ) : (
          <ProfileDisplay user={user} />
        )}
      </div>
    </div>
  );
}
