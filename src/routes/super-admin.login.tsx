import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, User, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { admin } from "@/lib/admin-store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/super-admin/login")({
  head: () => ({
    meta: [
      { title: "Super Admin Login — Mcphilix Go ERP" },
      { name: "description", content: "Secure sign-in for the Mcphilix Go ERP owner." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuperAdminLogin,
});

function SuperAdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

 const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // This calls your Supabase project to verify the email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username, // Your app uses 'username' for the email field
      password: password,
    });

    if (error) {
      // If the password or email is wrong, this shows the error to you
      toast.error(error.message); 
      return;
    }

    // If it succeeds, the user is now logged in!
    toast.success("Welcome, Super Admin");
    navigate({ to: "/super-admin/client-control" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[radial-gradient(120%_80%_at_50%_0%,hsl(var(--primary)/0.12),transparent_60%)] p-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to bakery login
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 grid place-items-center rounded-2xl bg-foreground text-background">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold">Super Admin</h1>
              <p className="text-xs text-muted-foreground">Owner access only</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="su-username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="su-username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="su-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="su-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-all duration-200 font-semibold"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-[11px] text-muted-foreground text-center leading-relaxed">
            Restricted area. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
