import { verifySession, getUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await verifySession();

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <SettingsClient user={user} />;
}
