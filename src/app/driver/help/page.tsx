import { HelpButtons } from "@/components/driver/help-buttons";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function DriverHelpPage() {
  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-10">
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        <Link
          href="/driver"
          className="text-sm text-ink-muted hover:text-ink"
        >
          Close
        </Link>
      </header>

      <div className="mt-10">
        <p className="text-xs uppercase tracking-[0.16em] font-bold text-trust">
          Need help?
        </p>
        <h1 className="mt-2 font-display font-bold text-3xl tracking-[-0.02em] text-ink leading-tight">
          What's happening?
        </h1>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
          One tap. We'll let the dispatcher know — you don't need to explain
          twice.
        </p>
      </div>

      <HelpButtons />
    </div>
  );
}
