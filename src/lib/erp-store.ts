import { useState, useEffect } from "react";
import { supabase } from "./supabase";

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
  item: string;
  size: string;
  deliveryDate: string;
  createdAt: string;
  note?: string;
  status: OrderStatus;
  sellingPrice: number;
  costPrice: number;
};

export function useErp() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: recipesData } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (recipesData) {
        setRecipes(
          recipesData.map((r) => ({
            id: r.id,
            name: r.name,
            sellingPrice: Number(r.selling_price),
            costPrice: Number(r.cost_price),
            ingredients: r.ingredients || "",
            quantity: r.quantity || "",
            steps: r.steps || "",
            notes: r.notes || "",
          }))
        );
      }

      if (ordersData) {
        setOrders(
          ordersData.map((o) => ({
            id: o.id,
            customer: o.customer,
            phone: o.phone || "",
            location: o.location || "",
            item: o.item,
            size: o.size || "",
            deliveryDate: o.delivery_date || "",
            createdAt: o.created_at,
            note: o.note,
            status: o.status as OrderStatus,
            sellingPrice: Number(o.selling_price),
            costPrice: Number(o.cost_price),
          }))
        );
      }
    } catch (err) {
      console.error("Error pulling database profiles:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return { recipes, orders, loading, refresh: fetchData };
}

export const erp = {
  async addRecipe(r: Omit<Recipe, "id">, onComplete?: () => void) {
    await supabase.from("recipes").insert([{
      name: r.name,
      selling_price: r.sellingPrice,
      cost_price: r.costPrice,
      ingredients: r.ingredients,
      quantity: r.quantity,
      steps: r.steps,
      notes: r.notes
    }]);
    if (onComplete) onComplete();
  },

  async updateRecipe(id: string, patch: Partial<Recipe>, onComplete?: () => void) {
    await supabase.from("recipes").update({
      name: patch.name,
      selling_price: patch.sellingPrice,
      cost_price: patch.costPrice,
      ingredients: patch.ingredients,
      quantity: patch.quantity,
      steps: patch.steps,
      notes: patch.notes
    }).eq("id", id);
    if (onComplete) onComplete();
  },

  async addOrder(
    o: Omit<Order, "id" | "createdAt" | "status" | "sellingPrice" | "costPrice">, 
    currentRecipes: Recipe[],
    onComplete?: () => void
  ) {
    const recipe = currentRecipes.find((r) => r.name === o.item);
    await supabase.from("orders").insert([{
      customer: o.customer,
      phone: o.phone,
      location: o.location,
      item: o.item,
      size: o.size,
      note: o.note,
      status: "Pending",
      selling_price: recipe?.sellingPrice ?? 0,
      cost_price: recipe?.costPrice ?? 0,
      delivery_date: o.deliveryDate
    }]);
    if (onComplete) onComplete();
  },

  async updateOrderStatus(id: string, status: OrderStatus, onComplete?: () => void) {
    await supabase.from("orders").update({ status }).eq("id", id);
    if (onComplete) onComplete();
  }
};

  async updateRecipe(id: string, patch: Partial<Recipe>) {
    await supabase.from("recipes").update({
      name: patch.name,
      selling_price: patch.sellingPrice,
      cost_price: patch.costPrice,
      ingredients: patch.ingredients,
      quantity: patch.quantity,
      steps: patch.steps,
      notes: patch.notes
    }).eq("id", id);
  },

  async addOrder(o: Omit<Order, "id" | "createdAt" | "status" | "sellingPrice" | "costPrice">, currentRecipes: Recipe[]) {
    const recipe = currentRecipes.find((r) => r.name === o.item);
    await supabase.from("orders").insert([{
      customer: o.customer,
      phone: o.phone,
      location: o.location,
      item: o.item,
      size: o.size,
      note: o.note,
      status: "Pending",
      selling_price: recipe?.sellingPrice ?? 0,
      cost_price: recipe?.costPrice ?? 0,
      delivery_date: o.deliveryDate
    }]);
  },

  async updateOrderStatus(id: string, status: OrderStatus) {
    await supabase.from("orders").update({ status }).eq("id", id);
  }
};

export function priceOf(recipes: Recipe[], order: Order) {
  const r = recipes.find((x) => x.name === order.item);
  const selling = r ? r.sellingPrice : order.sellingPrice;
  const cost = r ? r.costPrice : order.costPrice;
  return { selling, cost, profit: selling - cost };
}
