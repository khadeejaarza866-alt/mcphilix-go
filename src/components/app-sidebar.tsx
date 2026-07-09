import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  ChefHat,
  LogOut,
  Cookie,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Active Orders", url: "/active-orders", icon: ClipboardList },
  { title: "Menu & Pricing", url: "/menu-pricing", icon: BookOpen },
  { title: "Purchase List", url: "/purchase-list", icon: ShoppingCart },
  { title: "Profit & Sales", url: "/profit-sales", icon: TrendingUp },
  { title: "Recipes", url: "/recipes", icon: ChefHat },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-sidebar-border bg-sidebar z-30">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]">
          <Cookie className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold leading-tight truncate">
            Its Sugar Cup
          </p>
          <p className="text-xs text-muted-foreground">Bakery ERP</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent transition"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
