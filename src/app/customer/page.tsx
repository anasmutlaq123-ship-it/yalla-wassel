import { getCurrentUser } from "@/lib/auth";
import { CustomerDashboard } from "@/components/customer/dashboard";

export default async function CustomerHomePage() {
  const user = await getCurrentUser();
  return <CustomerDashboard userId={user!.id} userName={user!.name} />;
}
