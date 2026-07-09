import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
  Award,
  Sparkles,
} from "lucide-react";
import { priceOf, useErp } from "@/lib/erp-store";

export const Route = createFileRoute("/dashboard/performance")({
  head: () => ({ meta: [{ title: "Business Performance — Mcphilix Go ERP" }] }),
  component: PerformancePage,
});

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PerformancePage() {
  const { orders, recipes } = useErp();

  const data = useMemo(() => {
    const today = new Date();
    const isSameDay = (d: Date) => d.toDateString() === today.toDateString();
    const isSameMonth = (d: Date) =>
      d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    const isSameYear = (d: Date) => d.getFullYear() === today.getFullYear();

    let todaySales = 0,
      todayProfit = 0,
      monthSales = 0,
      monthProfit = 0,
      yearSales = 0,
      yearProfit = 0,
      total = 0;

    const byProductSales = new Map<string, number>();
    const byProductProfit = new Map<string, number>();
    const dailyMap = new Map<string, { sales: number; profit: number }>();
    const monthlyMap = new Map<string, { sales: number; profit: number }>();

    for (const o of orders) {
      const { selling, profit } = priceOf(recipes, o);
      const d = new Date(o.createdAt);
      total += 1;
      if (isSameYear(d)) {
        yearSales += selling;
        yearProfit += profit;
      }
      if (isSameMonth(d)) {
        monthSales += selling;
        monthProfit += profit;
      }
      if (isSameDay(d)) {
        todaySales += selling;
        todayProfit += profit;
      }
      byProductSales.set(o.item, (byProductSales.get(o.item) ?? 0) + selling);
      byProductProfit.set(o.item, (byProductProfit.get(o.item) ?? 0) + profit);

      const dayKey = d.toISOString().slice(0, 10);
      const dayEntry = dailyMap.get(dayKey) ?? { sales: 0, profit: 0 };
      dayEntry.sales += selling;
      dayEntry.profit += profit;
      dailyMap.set(dayKey, dayEntry);

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const mEntry = monthlyMap.get(monthKey) ?? { sales: 0, profit: 0 };
      mEntry.sales += selling;
      mEntry.profit += profit;
      monthlyMap.set(monthKey, mEntry);
    }

    const daily = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, v]) => ({ date: date.slice(5), ...v }));

    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, v]) => ({ month: month.slice(2), ...v }));

    const byProduct = Array.from(byProductSales.entries()).map(([name, sales]) => ({
      name,
      sales,
      profit: byProductProfit.get(name) ?? 0,
    }));

    const best = byProduct.reduce<{ name: string; sales: number } | null>(
      (acc, x) => (!acc || x.sales > acc.sales ? { name: x.name, sales: x.sales } : acc),
      null,
    );
    const topProfit = byProduct.reduce<{ name: string; profit: number } | null>(
      (acc, x) => (!acc || x.profit > acc.profit ? { name: x.name, profit: x.profit } : acc),
      null,
    );

    const avgOrder = total ? yearSales / total : 0;

    return {
      todaySales,
      todayProfit,
      monthSales,
      monthProfit,
      yearSales,
      yearProfit,
      total,
      avgOrder,
      best,
      topProfit,
      daily,
      monthly,
      byProduct: byProduct.sort((a, b) => b.sales - a.sales).slice(0, 8),
    };
  }, [orders, recipes]);

  const kpis = [
    { label: "Today's Sales", value: fmt(data.todaySales), icon: DollarSign },
    { label: "Today's Profit", value: fmt(data.todayProfit), icon: TrendingUp },
    { label: "Monthly Sales", value: fmt(data.monthSales), icon: Calendar },
    { label: "Monthly Profit", value: fmt(data.monthProfit), icon: TrendingUp },
    { label: "Annual Sales", value: fmt(data.yearSales), icon: DollarSign },
    { label: "Annual Profit", value: fmt(data.yearProfit), icon: TrendingUp },
    { label: "Total Orders", value: String(data.total), icon: Package },
    { label: "Avg Order Value", value: fmt(data.avgOrder), icon: Sparkles },
    {
      label: "Best Selling Product",
      value: data.best?.name ?? "—",
      icon: Award,
      sub: data.best ? fmt(data.best.sales) : "",
    },
    {
      label: "Highest Profit Product",
      value: data.topProfit?.name ?? "—",
      icon: Award,
      sub: data.topProfit ? fmt(data.topProfit.profit) : "",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <Card
            key={k.label}
            className="p-4 rounded-2xl border-0 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center">
                <k.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-lg sm:text-xl font-bold truncate">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
            {k.sub && <p className="text-[11px] text-primary mt-1">{k.sub}</p>}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Daily Sales">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Profit">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Sales Trend">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Profit Trend">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product-wise Sales" wide>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byProduct}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" fontSize={10} interval={0} angle={-15} height={50} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product-wise Profit" wide>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byProduct}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" fontSize={10} interval={0} angle={-15} height={50} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {orders.length === 0 && (
        <Card className="p-6 text-center rounded-2xl border-dashed">
          <p className="text-sm text-muted-foreground">
            No orders yet — add orders and edit recipe prices to see reports update live.
          </p>
        </Card>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Card
      className={
        "p-4 sm:p-5 rounded-2xl border-border/60 shadow-[var(--shadow-card)] " +
        (wide ? "lg:col-span-2" : "")
      }
    >
      <h3 className="font-display text-base font-semibold mb-3">{title}</h3>
      {children}
    </Card>
  );
}
