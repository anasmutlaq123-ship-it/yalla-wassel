import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?as=customer");
  if (user.role !== "customer") {
    redirect(user.role === "dispatcher" ? "/dispatcher" : "/driver");
  }

  return (
    <main className="min-h-screen bg-canvas relative">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-hero-radial"
      />
      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-6 pb-16">
        {children}
      </div>
    </main>
  );
}
