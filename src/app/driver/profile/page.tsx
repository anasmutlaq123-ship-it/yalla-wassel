import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/ui/logo";
import { DriverProfile } from "@/components/driver/profile";

export default async function DriverProfilePage() {
  const user = await getCurrentUser();
  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-10">
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        <Link href="/driver" className="text-sm text-ink-muted hover:text-ink">
          Close
        </Link>
      </header>
      <DriverProfile driverId={user!.id} driverName={user!.name} area={user!.area} />
    </div>
  );
}
