// components/layout/HeaderWrapper.tsx
import { getCurrentUser } from "@/lib/dal";
import Header from "./Header";

export default async function HeaderWrapper() {
  const user = await getCurrentUser();

  return <Header user={user} />;
}
