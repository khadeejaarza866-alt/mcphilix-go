import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, BookOpen, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { erp, useErp, type Recipe } from "@/lib/erp-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/recipes")({
  head: () => ({ meta: [{ title: "Menu & Recipes — Mcphilix Go ERP" }] }),
  component: RecipesPage,
});

type FormState = Omit<Recipe, "id">;
const emptyForm: FormState = {
  name: "",
  sellingPrice: 0,
  costPrice: 0,
  ingredients: "",
  quantity: "",
  steps: "",
  notes: "",
};

function RecipesPage() {
  const { recipes } = useErp();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [recipeOpen, setRecipeOpen] = useState<Recipe | null>(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<Recipe | null>(null);

  const openRecipe = (r: Recipe) => {
    setRecipeOpen(r);
    setEditDraft(r);
    setEditing(false);
  };

  const saveRecipe = () => {
    if (!editDraft) return;
    if (!editDraft.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    erp.updateRecipe(editDraft.id, editDraft);
    setRecipeOpen(editDraft);
    setEditing(false);
    toast.success("Recipe updated");
  };

  const validateNew = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitNew = () => {
    if (!validateNew()) return;
    erp.addRecipe({ ...form, name: form.name.trim() });
    setAddOpen(false);
    setForm(emptyForm);
    setErrors({});
    toast.success("Recipe added");
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6 rounded-2xl border-border/60 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold">Menu & Recipes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edit prices anytime — profit updates instantly.
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="rounded-xl gap-1.5 shadow-[var(--shadow-soft)]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New Recipe</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <div className="rounded-xl border border-border/60 overflow-x-auto">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="min-w-[180px]">Product Name</TableHead>
                <TableHead className="min-w-[140px]">Selling Price</TableHead>
                <TableHead className="min-w-[140px]">Cost Price</TableHead>
                <TableHead className="min-w-[130px]">Profit / Item</TableHead>
                <TableHead className="min-w-[100px]">Recipe</TableHead>
                <TableHead className="min-w-[90px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((r) => {
                const profit = r.sellingPrice - r.costPrice;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={r.sellingPrice}
                        onChange={(e) =>
                          erp.updateRecipe(r.id, {
                            sellingPrice: Number(e.target.value) || 0,
                          })
                        }
                        className="h-9 w-full min-w-[120px] rounded-lg text-right tabular-nums font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={r.costPrice}
                        onChange={(e) =>
                          erp.updateRecipe(r.id, {
                            costPrice: Number(e.target.value) || 0,
                          })
                        }
                        className="h-9 w-full min-w-[120px] rounded-lg text-right tabular-nums font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          "inline-flex justify-end min-w-[90px] px-2.5 py-1 rounded-lg text-sm font-semibold tabular-nums " +
                          (profit >= 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600")
                        }
                      >
                        {profit.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRecipe(r)}
                        className="rounded-lg gap-1.5"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          openRecipe(r);
                          setEditing(true);
                        }}
                        className="rounded-lg gap-1.5"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add New Recipe */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) {
            setForm(emptyForm);
            setErrors({});
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add New Recipe</DialogTitle>
            <DialogDescription>
              Create a bakery item. It becomes available for orders immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl"
                placeholder="e.g. Tiramisu Cake"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm({ ...form, sellingPrice: Number(e.target.value) || 0 })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm({ ...form, costPrice: Number(e.target.value) || 0 })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Ingredients</Label>
              <Textarea
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                className="rounded-xl min-h-[70px]"
                placeholder="Flour, sugar, butter…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="rounded-xl"
                placeholder="Yields 1 kg cake"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preparation Steps</Label>
              <Textarea
                value={form.steps}
                onChange={(e) => setForm({ ...form, steps: e.target.value })}
                className="rounded-xl min-h-[90px]"
                placeholder="Step-by-step instructions…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="rounded-xl min-h-[60px]"
                placeholder="Optional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setAddOpen(false);
                setForm(emptyForm);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={submitNew}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe details popup */}
      <Dialog
        open={!!recipeOpen}
        onOpenChange={(o) => {
          if (!o) {
            setRecipeOpen(null);
            setEditing(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl">
          {recipeOpen && editDraft && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editing ? "Edit Recipe" : editDraft.name}
                </DialogTitle>
                <DialogDescription>
                  {editing ? "Update recipe details." : "Recipe details"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {editing && (
                  <div className="space-y-1.5">
                    <Label>Product Name</Label>
                    <Input
                      value={editDraft.name}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, name: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                )}

                <RecipeField
                  label="Ingredients"
                  editing={editing}
                  value={editDraft.ingredients}
                  onChange={(v) => setEditDraft({ ...editDraft, ingredients: v })}
                  multiline
                />
                <RecipeField
                  label="Quantity"
                  editing={editing}
                  value={editDraft.quantity}
                  onChange={(v) => setEditDraft({ ...editDraft, quantity: v })}
                />
                <RecipeField
                  label="Preparation Steps"
                  editing={editing}
                  value={editDraft.steps}
                  onChange={(v) => setEditDraft({ ...editDraft, steps: v })}
                  multiline
                />
                <RecipeField
                  label="Notes"
                  editing={editing}
                  value={editDraft.notes}
                  onChange={(v) => setEditDraft({ ...editDraft, notes: v })}
                  multiline
                />
              </div>

              <DialogFooter>
                {editing ? (
                  <>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        setEditDraft(recipeOpen);
                        setEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="rounded-xl" onClick={saveRecipe}>
                      Save
                    </Button>
                  </>
                ) : (
                  <Button className="rounded-xl" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4 mr-1.5" /> Edit
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecipeField({
  label,
  value,
  onChange,
  editing,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {editing ? (
        multiline ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-xl min-h-[80px]"
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-xl"
          />
        )
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap rounded-xl bg-secondary/40 px-3 py-2 min-h-[40px]">
          {value || <span className="text-muted-foreground">—</span>}
        </p>
      )}
    </div>
  );
}
