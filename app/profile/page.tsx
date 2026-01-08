import { Suspense } from "react";
import { verifySession, getUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import ProfileStatsWrapper from "@/components/profile/ProfileStatsWrapper";
import ProfileStatsSkeleton from "@/components/profile/ProfileStatsSkeleton";

export default async function ProfilePage() {
  const session = await verifySession();

  // Only allow customers to access this page
  if (session.role !== "CUSTOMER") {
    redirect("/menu");
  }

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileClient user={user}>
      <Suspense fallback={<ProfileStatsSkeleton />}>
        <ProfileStatsWrapper />
      </Suspense>
    </ProfileClient>
  );
}
