import { DriverShell } from "@/components/driver/shell";
import { getCurrentUser } from "@/lib/auth";

export default async function DriverHomePage() {
  const user = await getCurrentUser();
  return <DriverShell userId={user!.id} userName={user!.name} />;
}
