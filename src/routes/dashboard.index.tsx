import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShoppingBag,
  ClipboardList,
  Clock,
  CheckCircle2,
  Plus,
  CalendarIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { erp, useErp, type OrderStatus } from "@/lib/erp-store";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [{ title: "Active Orders — Mcphilix Go ERP" }],
  }),
  component: ActiveOrders,
});

const CAKE_SIZES = ["500 g", "1 kg", "1.5 kg", "2 kg", "3 kg", "Custom Size"];

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-50 text-amber-600",
  "In Progress": "bg-primary/15 text-primary",
  Completed: "bg-emerald-50 text-emerald-600",
};

const avatarPalette = [
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-sky-100 text-sky-600",
  "bg-violet-100 text-violet-600",
  "bg-pink-100 text-pink-600",
];

const TABS = ["All", "Pending", "In Progress", "Completed"] as const;
type Tab = (typeof TABS)[number];

type FormState = {
  customer: string;
  phone: string;
  location: string;
  item: string;
  size: string;
  deliveryDate: Date | undefined;
  note: string;
};

const emptyForm: FormState = {
  customer: "",
  phone: "",
  location: "",
  item: "",
  size: "",
  deliveryDate: undefined,
  note: "",
};

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function ActiveOrders() {
  const { orders, recipes } = useErp();
  const [tab, setTab] = useState<Tab>("All");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const filtered = useMemo(
    () => (tab === "All" ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab],
  );

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const inProgress = orders.filter((o) => o.status === "In Progress").length;
    const today = new Date().toDateString();
    const completedToday = orders.filter(
      (o) => o.status === "Completed" && new Date(o.deliveryDate).toDateString() === today,
    ).length;
    return [
      { label: "Total Orders", value: total, icon: ShoppingBag },
      { label: "Pending Orders", value: pending, icon: ClipboardList },
      { label: "In Progress", value: inProgress, icon: Clock },
      { label: "Completed Today", value: completedToday, icon: CheckCircle2 },
    ];
  }, [orders]);

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.customer.trim()) e.customer = "Customer name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.item) e.item = "Order item is required";
    if (!form.size) e.size = "Cake size is required";
    if (!form.deliveryDate) e.deliveryDate = "Delivery date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
  };

  const submit = () => {
    if (!validate()) return;
    erp.addOrder({
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      item: form.item,
      size: form.size,
      deliveryDate: form.deliveryDate!.toISOString(),
      note: form.note.trim() || undefined,
    });
    setAddOpen(false);
    resetForm();
    toast.success("Order added successfully");
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="p-4 rounded-[20px] border-0 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Orders */}
      <Card className="p-4 sm:p-6 rounded-2xl border-border/60 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
            Active Orders
          </h2>
          <Button
            onClick={() => setAddOpen(true)}
            className="rounded-xl gap-1.5 shadow-[var(--shadow-soft)]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New Order</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="bg-secondary/60 rounded-xl p-1 h-auto flex flex-wrap gap-1">
            {TABS.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-3 py-1.5 text-xs sm:text-sm"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-secondary/60 grid place-items-center mb-3">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No active orders yet.</p>
            </div>
          ) : (
            filtered.map((o, i) => (
              <div
                key={o.id}
                className="rounded-2xl border border-border/60 bg-white p-4 hover:shadow-[var(--shadow-card)] transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full grid place-items-center font-semibold text-sm shrink-0 ${avatarPalette[i % avatarPalette.length]}`}
                  >
                    {initialsOf(o.customer)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">{o.customer}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {o.location || o.phone}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${statusStyles[o.status]}`}
                  >
                    {o.status}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {o.item} · {o.size}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Delivery: {format(new Date(o.deliveryDate), "PPP")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={o.status === "Completed" ? "secondary" : "default"}
                    disabled={o.status === "Completed"}
                    onClick={() => erp.updateOrderStatus(o.id, "Completed")}
                    className="rounded-lg shrink-0"
                  >
                    {o.status === "Completed" ? "Done" : "Mark Done"}
                  </Button>
                </div>

                <div className="mt-2 flex items-start gap-2 rounded-xl bg-secondary/40 px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0 mt-0.5">
                    Note
                  </span>
                  <p className="text-xs text-foreground whitespace-pre-wrap break-words">
                    {o.note?.trim() ? o.note : <span className="text-muted-foreground">—</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add Order Modal */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add New Order</DialogTitle>
            <DialogDescription>Fill in the details to create a new order.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Customer Information</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="customer">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer"
                    value={form.customer}
                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                    placeholder="e.g. Amelia Chen"
                    className="rounded-xl"
                  />
                  {errors.customer && (
                    <p className="text-xs text-destructive">{errors.customer}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +60 12 345 6789"
                    className="rounded-xl"
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Delivery address"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Order Details</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>
                    Order Item <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.item}
                    onValueChange={(v) => setForm({ ...form, item: v })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map((r) => (
                        <SelectItem key={r.id} value={r.name}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.item && <p className="text-xs text-destructive">{errors.item}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Cake Size <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.size}
                    onValueChange={(v) => setForm({ ...form, size: v })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAKE_SIZES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.size && <p className="text-xs text-destructive">{errors.size}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Delivery Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-xl",
                          !form.deliveryDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.deliveryDate ? (
                          format(form.deliveryDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.deliveryDate}
                        onSelect={(d) => setForm({ ...form, deliveryDate: d })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.deliveryDate && (
                    <p className="text-xs text-destructive">{errors.deliveryDate}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="note">Special Note</Label>
                  <Textarea
                    id="note"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Any special instructions…"
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                resetForm();
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button onClick={submit} className="rounded-xl">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShoppingBag,
  ClipboardList,
  Clock,
  CheckCircle2,
  Plus,
  CalendarIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { erp, useErp, type OrderStatus } from "@/lib/erp-store";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [{ title: "Active Orders — Mcphilix Go ERP" }],
  }),
  component: ActiveOrders,
});

const CAKE_SIZES = ["500 g", "1 kg", "1.5 kg", "2 kg", "3 kg", "Custom Size"];

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-50 text-amber-600",
  "In Progress": "bg-primary/15 text-primary",
  Completed: "bg-emerald-50 text-emerald-600",
};

const avatarPalette = [
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-sky-100 text-sky-600",
  "bg-violet-100 text-violet-600",
  "bg-pink-100 text-pink-600",
];

const TABS = ["All", "Pending", "In Progress", "Completed"] as const;
type Tab = (typeof TABS)[number];

type FormState = {
  customer: string;
  phone: string;
  location: string;
  item: string;
  size: string;
  deliveryDate: Date | undefined;
  note: string;
};

const emptyForm: FormState = {
  customer: "",
  phone: "",
  location: "",
  item: "",
  size: "",
  deliveryDate: undefined,
  note: "",
};

function initialsOf(name: string) {
  if (!name.trim()) return "U"; // Default to 'U' for Unknown/Unnamed
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

function ActiveOrders() {
  const { orders, recipes, refresh } = useErp();
  const [tab, setTab] = useState<Tab>("All");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(
    () => (tab === "All" ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab],
  );

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const inProgress = orders.filter((o) => o.status === "In Progress").length;
    const today = new Date().toDateString();
    const completedToday = orders.filter(
      (o) => o.status === "Completed" && (o.deliveryDate ? new Date(o.deliveryDate).toDateString() === today : false),
    ).length;
    return [
      { label: "Total Orders", value: total, icon: ShoppingBag },
      { label: "Pending Orders", value: pending, icon: ClipboardList },
      { label: "In Progress", value: inProgress, icon: Clock },
      { label: "Completed Today", value: completedToday, icon: CheckCircle2 },
    ];
  }, [orders]);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const submit = () => {
    // All client validation logic removed to allow completely optional fields
    erp.addOrder(
      {
        customer: form.customer.trim() || "Unnamed Customer",
        phone: form.phone.trim() || "N/A",
        location: form.location.trim() || "N/A",
        item: form.item || "Unspecified Item",
        size: form.size || "Unspecified Size",
        deliveryDate: form.deliveryDate ? form.deliveryDate.toISOString() : new Date().toISOString(),
        note: form.note.trim() || undefined,
      },
      recipes,
      () => {
        refresh();
        toast.success("Order added successfully");
      }
    );
    
    setAddOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="p-4 rounded-[20px] border-0 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Orders */}
      <Card className="p-4 sm:p-6 rounded-2xl border-border/60 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
            Active Orders
          </h2>
          <Button
            onClick={() => setAddOpen(true)}
            className="rounded-xl gap-1.5 shadow-[var(--shadow-soft)]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New Order</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="bg-secondary/60 rounded-xl p-1 h-auto flex flex-wrap gap-1">
            {TABS.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-3 py-1.5 text-xs sm:text-sm"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-secondary/60 grid place-items-center mb-3">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No active orders yet.</p>
            </div>
          ) : (
            filtered.map((o, i) => (
              <div
                key={o.id}
                className="rounded-2xl border border-border/60 bg-white p-4 hover:shadow-[var(--shadow-card)] transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full grid place-items-center font-semibold text-sm shrink-0 ${avatarPalette[i % avatarPalette.length]}`}
                  >
                    {initialsOf(o.customer)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">{o.customer}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {o.location && o.location !== "N/A" ? o.location : o.phone}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${statusStyles[o.status]}`}
                  >
                    {o.status}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {o.item} · {o.size}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Delivery: {o.deliveryDate ? format(new Date(o.deliveryDate), "PPP") : "Not Set"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={o.status === "Completed" ? "secondary" : "default"}
                    disabled={o.status === "Completed"}
                    onClick={() => erp.updateOrderStatus(o.id, "Completed", refresh)}
                    className="rounded-lg shrink-0"
                  >
                    {o.status === "Completed" ? "Done" : "Mark Done"}
                  </Button>
                </div>

                <div className="mt-2 flex items-start gap-2 rounded-xl bg-secondary/40 px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0 mt-0.5">
                    Note
                  </span>
                  <p className="text-xs text-foreground whitespace-pre-wrap break-words">
                    {o.note?.trim() ? o.note : <span className="text-muted-foreground">—</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add Order Modal */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add New Order</DialogTitle>
            <DialogDescription>Fill in the details to create a new order.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Customer Information</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    value={form.customer}
                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                    placeholder="e.g. Amelia Chen"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +60 12 345 6789"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Delivery address"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Order Details</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Order Item</Label>
                  <Select
                    value={form.item}
                    onValueChange={(v) => setForm({ ...form, item: v })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map((r) => (
                        <SelectItem key={r.id} value={r.name}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Cake Size</Label>
                  <Select
                    value={form.size}
                    onValueChange={(v) => setForm({ ...form, size: v })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAKE_SIZES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-xl",
                          !form.deliveryDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.deliveryDate ? (
                          format(form.deliveryDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.deliveryDate}
                        onSelect={(d) => setForm({ ...form, deliveryDate: d })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="note">Special Note</Label>
                  <Textarea
                    id="note"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Any special instructions…"
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                resetForm();
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button onClick={submit} className="rounded-xl">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
