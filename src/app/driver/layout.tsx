import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?as=driver");
  if (user.role !== "driver") redirect("/dispatcher");

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {children}
      </div>
    </main>
  );
}
