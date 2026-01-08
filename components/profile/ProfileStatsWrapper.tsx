import { getProfileStatsServer } from "@/actions/profile";
import ProfileStatsCard from "./ProfileStats";

export default async function ProfileStatsWrapper() {
  const stats = await getProfileStatsServer();
  return <ProfileStatsCard stats={stats} isLoading={false} />;
}
