"use client";

import { useToast } from "@/context/ToastContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, ProfileStats, ProfileFormData } from "@/types/profile";
import { validatePhone, isProfileComplete } from "@/utils/profileValidation";
import ProfileWarningBanner from "@/components/profile/ProfileWarningBanner";
import ProfileInformationCard from "@/components/profile/ProfileInformationCard";
import ProfileStatsCard from "@/components/profile/ProfileStats";
import { updateProfile } from "@/actions/profile";

interface ProfileClientProps {
  user: User;
  initialStats: ProfileStats | null;
}

export default function ProfileClient({ user, initialStats }: ProfileClientProps) {
  const { addToast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Optimistic UI state - updates immediately on save
  const [currentUser, setCurrentUser] = useState<User>(user);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user.name,
    phone: user.phone || "",
    barangay: user.barangay || "",
    street: user.street || "",
    landmark: user.landmark || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync currentUser when server data updates (after router.refresh)
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.trim().length < 2) {
      addToast("Name must be at least 2 characters long", "error");
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      addToast("Invalid phone format. Use 09XXXXXXXXX", "error");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        barangay: formData.barangay.trim() || null,
        street: formData.street.trim() || null,
        landmark: formData.landmark.trim() || null,
      });

      if (result.error) {
        addToast(result.error, "error");
      } else if (result.success && result.user) {
        // Optimistic UI update - update display immediately
        setCurrentUser(result.user);

        // Update local form data with server response
        setFormData({
          name: result.user.name,
          phone: result.user.phone || "",
          barangay: result.user.barangay || "",
          street: result.user.street || "",
          landmark: result.user.landmark || "",
        });

        addToast("Profile updated successfully!", "success");
        setIsEditing(false);

        // Refresh server component data in background
        router.refresh();
      }
    } catch {
      addToast("Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      phone: currentUser.phone || "",
      barangay: currentUser.barangay || "",
      street: currentUser.street || "",
      landmark: currentUser.landmark || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="dark:from-background dark:to-background min-h-dvh bg-gradient-to-b from-gray-50 to-white px-4 py-6 md:py-12 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="dark:text-foreground text-2xl md:text-4xl font-bold tracking-tight text-black">
            My Profile
          </h1>
          <p className="mt-1.5 md:mt-2 text-sm md:text-lg text-black/70 dark:text-white/70">
            Manage your information for faster ordering and delivery
          </p>
        </div>

        {/* Profile Incomplete Warning */}
        {!isProfileComplete(currentUser) && !isEditing && (
          <ProfileWarningBanner onCompleteClick={() => setIsEditing(true)} />
        )}

        {/* Profile Information Card */}
        <ProfileInformationCard
          user={currentUser}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />

        {/* Statistics Card */}
        <ProfileStatsCard stats={initialStats} isLoading={false} />
      </div>
    </div>
  );
}
