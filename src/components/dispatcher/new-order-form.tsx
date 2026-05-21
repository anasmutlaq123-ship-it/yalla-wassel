"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function NewOrderForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    pickupBusiness: "",
    pickupArea: "",
    recipientName: "",
    recipientArea: "",
    recipientNotes: "",
    priority: "normal" as "normal" | "urgent",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setForm({
        pickupBusiness: "",
        pickupArea: "",
        recipientName: "",
        recipientArea: "",
        recipientNotes: "",
        priority: "normal",
      });
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ New order</Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.form
              onSubmit={submit}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-surface border border-surface-line rounded-2xl shadow-lift p-6"
            >
              <h2 className="text-lg font-semibold tracking-tight">
                New order
              </h2>
              <p className="text-sm text-ink-muted mt-0.5">
                Created as <strong className="text-ink">Pending</strong>. Go
                to Dispatch to assign.
              </p>

              <div className="mt-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pb">Pickup business</Label>
                    <Input
                      id="pb"
                      required
                      placeholder="Reem Pharmacy"
                      value={form.pickupBusiness}
                      onChange={(e) =>
                        setForm({ ...form, pickupBusiness: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="pa">Pickup area</Label>
                    <Input
                      id="pa"
                      required
                      placeholder="Wadi Saqra"
                      value={form.pickupArea}
                      onChange={(e) =>
                        setForm({ ...form, pickupArea: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="rn">Recipient name</Label>
                    <Input
                      id="rn"
                      required
                      placeholder="Hala D."
                      value={form.recipientName}
                      onChange={(e) =>
                        setForm({ ...form, recipientName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="ra">Recipient area</Label>
                    <Input
                      id="ra"
                      required
                      placeholder="Khalda"
                      value={form.recipientArea}
                      onChange={(e) =>
                        setForm({ ...form, recipientArea: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rno">Notes (optional)</Label>
                  <Input
                    id="rno"
                    placeholder="Apt 4B · ring twice"
                    value={form.recipientNotes}
                    onChange={(e) =>
                      setForm({ ...form, recipientNotes: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="flex gap-2">
                    {(["normal", "urgent"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, priority: p })}
                        className={
                          form.priority === p
                            ? "flex-1 h-11 rounded-xl bg-ink text-canvas text-sm font-medium"
                            : "flex-1 h-11 rounded-xl bg-surface border border-surface-line text-ink-soft text-sm font-medium hover:bg-surface-sunken"
                        }
                      >
                        {p === "urgent" ? "Urgent" : "Normal"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Creating…" : "Create order"}
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
