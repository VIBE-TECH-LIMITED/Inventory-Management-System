import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  ClipboardList,
  ArrowUpRight,
  Plus,
  ScanBarcode,
  FileBarChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products, transactions, salesByDay, categoryShare, stockRequests } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Quick Save" }] }),
  component: Dashboard,
});

const pieColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

function Dashboard() {
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const pending = stockRequests.filter((r) => r.status === "pending").length;
  const revenueToday = salesByDay[salesByDay.length - 1].sales;
  const ordersToday = salesByDay[salesByDay.length - 1].orders;

  const stats = [
    { label: "Total Products", value: String(products.length), icon: Package, tint: "bg-primary/10 text-primary" },
    { label: "Sales Today", value: String(ordersToday), icon: ShoppingCart, tint: "bg-info/10 text-info" },
    { label: "Revenue Today (KSh)", value: revenueToday.toLocaleString(), icon: DollarSign, tint: "bg-success/10 text-success" },
    { label: "Low Stock Items", value: String(lowStock + outOfStock), icon: AlertTriangle, tint: "bg-warning/10 text-warning" },
    { label: "Pending Requests", value: String(pending), icon: ClipboardList, tint: "bg-accent text-accent-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live overview of your store performance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link to="/products"><Plus className="h-4 w-4" /> Add Product</Link></Button>
          <Button variant="outline" asChild><Link to="/pos"><ScanBarcode className="h-4 w-4" /> New Sale</Link></Button>
          <Button asChild><Link to="/reports"><FileBarChart className="h-4 w-4" /> View Reports</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tint}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
                  <ArrowUpRight className="h-3 w-3" /> 12%
                </span>
              </div>
              <div className="mt-4 text-2xl font-bold tracking-tight">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Weekly sales</CardTitle>
              <CardDescription>Revenue (KSh) across the past 7 days</CardDescription>
            </div>
            <Badge variant="secondary">This week</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <AreaChart data={salesByDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category share</CardTitle>
            <CardDescription>Revenue split by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {categoryShare.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>Today's sales across all registers</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild><Link to="/reports">View all</Link></Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total (KSh)</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.id}</TableCell>
                  <TableCell>{t.time}</TableCell>
                  <TableCell>{t.cashier}</TableCell>
                  <TableCell className="text-right">{t.items}</TableCell>
                  <TableCell className="text-right font-semibold">{t.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={t.method === "M-Pesa" ? "default" : "secondary"}>{t.method}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
