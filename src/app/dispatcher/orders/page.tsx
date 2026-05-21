import { OrdersList } from "@/components/dispatcher/orders-list";
import { NewOrderForm } from "@/components/dispatcher/new-order-form";

export default function OrdersPage() {
  return (
    <div className="p-6 md:p-10 max-w-[1240px]">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] font-bold text-trust">
            All orders
          </p>
          <h1 className="mt-2 font-display font-bold text-4xl sm:text-5xl tracking-[-0.025em] text-ink leading-none">
            Today's deliveries
          </h1>
          <p className="mt-3 text-[15px] text-ink-muted">
            One row per order. Newest first. Tap to open the timeline.
          </p>
        </div>
        <NewOrderForm />
      </header>
      <OrdersList />
    </div>
  );
}
