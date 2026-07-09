import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Cookie, User, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { admin } from "@/lib/admin-store";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Login — Mcphilix Go ERP" },
      {
        name: "description",
        content: "Sign in to Mcphilix Go ERP to manage orders, recipes, and profits.",
      },
      { property: "og:title", content: "Mcphilix Go ERP" },
      { property: "og:description", content: "Bakery management, refined." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Please enter both username and password");
      return;
    }
    const result = admin.loginBakery(username.trim(), password);
    if (!result.ok) {
      if (result.reason === "expired") {
        toast.error("Subscription expired. Please contact administration.");
      } else {
        toast.error("Invalid username or password");
      }
      return;
    }
    toast.success(`Welcome, ${result.account.businessName}`);
    navigate({ to: "/dashboard" });
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-[image:var(--gradient-soft)] overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]">
            <Cookie className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">Mcphilix Go</p>
            <p className="text-xs text-muted-foreground">ERP</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-5xl leading-tight font-semibold text-foreground">
            Sweet operations,
            <br />
            <span className="text-primary">beautifully managed.</span>
          </h1>
          <p className="mt-6 text-muted-foreground">
            Track orders, recipes, purchases, and profits — all from one elegant dashboard crafted
            for modern bakeries.
          </p>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mcphilix Go. Baked with care.
        </p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Mcphilix Go</p>
              <p className="text-xs text-muted-foreground">ERP</p>
            </div>
          </div>

          <h2 className="font-display text-3xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue managing your bakery.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className="pl-10 h-11 rounded-xl bg-secondary/50 border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-secondary/50 border-border"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#8B1E4B] text-white hover:bg-[#6E1740] active:scale-[0.98] shadow-[0_12px_30px_-10px_rgba(139,30,75,0.55)] transition-all duration-200 font-semibold tracking-wide"
            >
              Sign in
            </Button>

          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Owner only
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Link
            to="/super-admin/login"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-sm font-medium text-foreground transition-all duration-200 active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            Access Super Admin Dashboard
          </Link>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Only accounts issued by the Super Admin can sign in.
          </p>

        </div>
      </div>
    </div>
  );
}
