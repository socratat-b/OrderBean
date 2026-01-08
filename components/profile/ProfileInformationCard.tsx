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
    <div className="dark:border-border dark:bg-card mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="dark:border-border dark:from-muted/30 dark:to-muted/30 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 dark:bg-primary/10 rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary h-6 w-6"
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
            <h2 className="dark:text-card-foreground text-2xl font-bold text-gray-900">
              Profile Information
            </h2>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
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
