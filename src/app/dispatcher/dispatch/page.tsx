import { DispatchBoard } from "@/components/dispatcher/dispatch-board";

export default function DispatchPage() {
  return (
    <div className="p-6 md:p-10 max-w-[1100px]">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.16em] font-bold text-trust">
          Dispatch board
        </p>
        <h1 className="mt-2 font-display font-bold text-4xl sm:text-5xl tracking-[-0.025em] text-ink leading-none">
          Who gets this one?
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted max-w-xl leading-relaxed">
          Each suggestion is built from area match, current workload,
          availability, urgency, and familiarity. Take the pick, or override
          with a one-line reason — that's how the engine learns.
        </p>
      </header>
      <DispatchBoard />
    </div>
  );
}
