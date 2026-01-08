import { verifySession, getUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { getProfileStatsServer } from "@/actions/profile";

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

  // Fetch profile stats in Server Component (recommended pattern)
  const stats = await getProfileStatsServer();

  return <ProfileClient user={user} initialStats={stats} />;
}
