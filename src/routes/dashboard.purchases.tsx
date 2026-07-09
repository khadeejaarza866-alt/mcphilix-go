import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Check } from "lucide-react";
import { erp, useErp } from "@/lib/erp-store";

export const Route = createFileRoute("/dashboard/purchases")({
  head: () => ({ meta: [{ title: "Purchase List — Mcphilix Go ERP" }] }),
  component: PurchaseListPage,
});

function PurchaseListPage() {
  const { purchaseNotes } = useErp();
  const [value, setValue] = useState(purchaseNotes);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setValue(purchaseNotes);
  }, [purchaseNotes]);

  useEffect(() => {
    if (value === purchaseNotes) return;
    setSaved(false);
    const t = setTimeout(() => {
      erp.setPurchaseNotes(value);
      setSaved(true);
    }, 400);
    return () => clearTimeout(t);
  }, [value, purchaseNotes]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-5 sm:p-7 rounded-2xl border-border/60 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold">Purchase List</h2>
              <p className="text-xs text-muted-foreground">
                Jot down what needs restocking. Auto-saved.
              </p>
            </div>
          </div>
          <span
            className={
              "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full " +
              (saved
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600")
            }
          >
            {saved ? <Check className="h-3 w-3" /> : null}
            {saved ? "Saved" : "Saving…"}
          </span>
        </div>

        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={"☐ Flour\n☐ Sugar\n☐ Butter\n☐ Eggs\n☐ Chocolate\n☐ Cream\n☐ Cake Boxes"}
          className="rounded-xl min-h-[420px] font-mono text-sm leading-relaxed"
        />
      </Card>
    </div>
  );
}
