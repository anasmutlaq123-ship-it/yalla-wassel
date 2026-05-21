import { DriversGrid } from "@/components/dispatcher/drivers-grid";

export default function DriversPage() {
  return (
    <div className="p-6 lg:p-10 max-w-[1100px]">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.16em] font-bold text-trust">
          Mutual trust
        </p>
        <h1 className="mt-2 font-display font-bold text-4xl sm:text-5xl tracking-[-0.025em] text-ink leading-none">
          The team
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted max-w-xl leading-relaxed">
          Driver trust is what they've done. System trust is what they think
          of us. Both shown — neither hidden.
        </p>
      </header>
      <DriversGrid />
    </div>
  );
}
