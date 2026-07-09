import { useSyncExternalStore } from "react";

export type Recipe = {
  id: string;
  name: string;
  sellingPrice: number;
  costPrice: number;
  ingredients: string;
  quantity: string;
  steps: string;
  notes: string;
};

export type OrderStatus = "Pending" | "In Progress" | "Completed";

export type Order = {
  id: string;
  customer: string;
  phone: string;
  location: string;
  item: string; // Recipe name
  size: string;
  deliveryDate: string; // ISO
  createdAt: string; // ISO
  note?: string;
  status: OrderStatus;
  sellingPrice: number; 
  costPrice: number;
};

type State = {
  recipes: Recipe[];
  orders: Order[];
  purchaseNotes: string;
};

const STORAGE_KEY = "mcphilix-erp-state-v1";

const DEFAULT_RECIPES: Recipe[] = [
  "Brownie",
  "Assorted Brownie",
  "Chocolate Cake",
  "Black Forest Cake",
  "Pineapple Cake",
  "Red Velvet Cake",
  "Vanilla Cake",
  "Butterscotch Cake",
  "White Forest Cake",
  "Blueberry Cake",
  "Lotus Biscoff Cake",
  "Ferrero Rocher Cake",
  "KitKat Cake",
  "Oreo Cake",
  "Fresh Cream Cake",
  "Cupcakes",
  "Bento Cake",
  "Cake Pops",
  "Cookies",
  "Donuts",
].map((name, i) => ({
  id: `r-${i + 1}`,
  name,
  sellingPrice: 0,
  costPrice: 0,
  ingredients: "",
  quantity: "",
  steps: "",
  notes: "",
}));

const initialState: State = {
  recipes: DEFAULT_RECIPES,
  orders: [],
  purchaseNotes: "",
};

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      recipes: parsed.recipes?.length ? parsed.recipes : DEFAULT_RECIPES,
      orders: parsed.orders ?? [],
      purchaseNotes: parsed.purchaseNotes ?? "",
    };
  } catch {
    return initialState;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function setState(updater: (prev: State) => State) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const getSnapshot = () => state;
const getServerSnapshot = () => initialState;

export function useErp() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Actions
export const erp = {
  addRecipe(r: Omit<Recipe, "id">) {
    setState((s) => ({
      ...s,
      recipes: [{ ...r, id: `r-${Date.now()}` }, ...s.recipes],
    }));
  },
  updateRecipe(id: string, patch: Partial<Recipe>) {
    setState((s) => ({
      ...s,
      recipes: s.recipes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  },
  addOrder(o: Omit<Order, "id" | "createdAt" | "status" | "sellingPrice" | "costPrice">) {
    const recipe = state.recipes.find((r) => r.name === o.item);
    setState((s) => ({
      ...s,
      orders: [
        {
          ...o,
          id: `O-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString(),
          status: "Pending",
          sellingPrice: recipe?.sellingPrice ?? 0,
          costPrice: recipe?.costPrice ?? 0,
        },
        ...s.orders,
      ],
    }));
  },
  updateOrderStatus(id: string, status: OrderStatus) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  },
  setPurchaseNotes(notes: string) {
    setState((s) => ({ ...s, purchaseNotes: notes }));
  },
};

export function priceOf(recipes: Recipe[], order: Order) {
  const r = recipes.find((x) => x.name === order.item);
  const selling = r ? r.sellingPrice : order.sellingPrice;
  const cost = r ? r.costPrice : order.costPrice;
  return { selling, cost, profit: selling - cost };
}
