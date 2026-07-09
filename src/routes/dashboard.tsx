import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu as MenuIcon,
  ClipboardList,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  Cookie,
  UserCircle2,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Mcphilix Go ERP" },
      {
        name: "description",
        content: "Mcphilix Go ERP — orders, recipes, purchases and business performance.",
      },
    ],
  }),
  component: DashboardLayout,
});

type MenuItem = {
  title: string;
  to: "/dashboard" | "/dashboard/recipes" | "/dashboard/purchases" | "/dashboard/performance";
  icon: typeof ClipboardList;
  exact?: boolean;
};
const menuItems: MenuItem[] = [
  { title: "Active Orders", to: "/dashboard", icon: ClipboardList, exact: true },
  { title: "Menu & Recipes", to: "/dashboard/recipes", icon: BookOpen },
  { title: "Purchase List", to: "/dashboard/purchases", icon: ShoppingCart },
  { title: "Business Performance", to: "/dashboard/performance", icon: TrendingUp },
];

function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const currentTitle =
    menuItems.find((m) => (m.exact ? pathname === m.to : pathname.startsWith(m.to)))?.title ??
    "Dashboard";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-8 py-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="h-10 w-10 grid place-items-center rounded-xl bg-secondary/60 hover:bg-secondary transition"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col">
              <SheetHeader className="px-6 py-6 border-b border-border text-left">
                <SheetTitle className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]">
                    <Cookie className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold leading-tight">
                      Mcphilix Go
                    </p>
                    <p className="text-xs text-muted-foreground font-normal">ERP</p>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item) => {
                  const active = item.exact
                    ? pathname === item.to
                    : pathname.startsWith(item.to);
                  return (
                    <SheetClose asChild key={item.title}>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-secondary/60",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Mcphilix Go ERP</p>
            <h1 className="font-display text-xl sm:text-2xl font-semibold truncate">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account"
                  className="h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground grid place-items-center shadow-[var(--shadow-soft)] hover:opacity-95 transition"
                >
                  <UserCircle2 className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/" })}
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
