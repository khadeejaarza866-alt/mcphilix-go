import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  LogOut,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { admin, useAdmin, subscriptionInfo } from "@/lib/admin-store";

export const Route = createFileRoute("/super-admin/client-control")({
  head: () => ({
    meta: [
      { title: "Client Control — Mcphilix Go ERP" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientControl,
});

function ClientControl() {
  const navigate = useNavigate();
  // Assuming 'initialized' is part of your store to track auth load state
  const { accounts, superAdminAuthed, initialized } = useAdmin(); 
  const [addOpen, setAddOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Only redirect if auth is fully initialized and user is NOT authenticated
    if (initialized && !superAdminAuthed) {
      navigate({ to: "/super-admin/login" });
    }
  }, [superAdminAuthed, navigate, initialized]);

  // Show a simple loading state while waiting for auth to initialize
  if (!initialized) {
    return <div className="min-h-screen grid place-items-center">Loading...</div>;
  }

  if (!superAdminAuthed) return null;

  const logout = () => {
    admin.logoutSuperAdmin();
    navigate({ to: "/super-admin/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 sm:px-8 py-4">
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-foreground text-background">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Mcphilix Go ERP</p>
            <h1 className="font-display text-xl sm:text-2xl font-semibold truncate">
              Client Management Panel
            </h1>
          </div>
          <Button variant="outline" onClick={logout} className="rounded-xl gap-1.5">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="px-4 sm:px-8 py-6">
        <Card className="p-4 sm:p-6 rounded-2xl border-border/60 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold">Clients</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each client gets 30 days of access from creation. Use Renew to extend for another 30 days.
              </p>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-xl gap-1.5 bg-[#8B1E4B] hover:bg-[#6E1740] text-white shadow-[0_10px_30px_-10px_rgba(139,30,75,0.55)]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          <div className="rounded-xl border border-border/60 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40">
                  <TableHead className="min-w-[180px]">Business Name</TableHead>
                  <TableHead className="min-w-[140px]">Username</TableHead>
                  <TableHead className="min-w-[160px]">Password</TableHead>
                  <TableHead className="min-w-[200px]">Subscription Status</TableHead>
                  <TableHead className="min-w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No clients yet. Click "Add User" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((a) => {
                    const info = subscriptionInfo(a);
                    const isRevealed = !!revealed[a.id];
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.businessName}</TableCell>
                        <TableCell className="font-mono text-xs">{a.username}</TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5">
                            <span className="font-mono text-xs">
                              {isRevealed ? a.password : "•".repeat(Math.min(10, a.password.length))}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 rounded-lg"
                              onClick={() =>
                                setRevealed((r) => ({ ...r, [a.id]: !r[a.id] }))
                              }
                              title={isRevealed ? "Hide" : "Show"}
                            >
                              {isRevealed ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={
                                "inline-flex w-fit px-2 py-0.5 rounded-full text-[11px] font-medium " +
                                (info.status === "Active"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-red-50 text-red-600")
                              }
                            >
                              {info.status}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {info.status === "Active"
                                ? `${info.daysRemaining} day${info.daysRemaining === 1 ? "" : "s"} remaining`
                                : `Expired on ${info.expiresAt.toLocaleDateString()}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1.5">
                            <Button
                              size="sm"
                              className="rounded-lg h-8 gap-1 bg-[#8B1E4B] hover:bg-[#6E1740] text-white"
                              onClick={() => {
                                admin.renewSubscription(a.id);
                                toast.success("Subscription renewed for 30 days");
                              }}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Renew
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-lg h-8 px-2 text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm(`Delete ${a.businessName}?`)) {
                                  admin.deleteAccount(a.id);
                                  toast.success("Client deleted");
                                }
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <CreateAccountDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

// ... CreateAccountDialog and Field components remain the same ...
