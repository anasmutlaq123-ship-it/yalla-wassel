import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { DispatcherNav } from "@/components/dispatcher/nav";
import { SignOut } from "@/components/sign-out";

export default async function DispatcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?as=dispatcher");
  if (user.role !== "dispatcher") redirect("/driver");

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-surface-line sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-surface-line">
          <Logo size="sm" />
        </div>
        <DispatcherNav />
        <div className="mt-auto px-4 py-4 border-t border-surface-line">
          <div className="flex items-center gap-3 px-2 py-2 rounded-2xl">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink truncate">
                {user.name}
              </div>
              <div className="text-[11px] text-ink-muted">Dispatcher</div>
            </div>
          </div>
          <SignOut className="mt-1 ml-2" />
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
