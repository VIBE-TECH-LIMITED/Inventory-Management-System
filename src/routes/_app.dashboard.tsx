import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
  Loader2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  ProductsAPI,
  ReportsAPI,
  StocksAPI,
  TransactionsAPI,
} from "@/lib/api";

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
  const productsQ = useQuery({ queryKey: ["products", "active"], queryFn: () => ProductsAPI.active() });
  const dailyQ = useQuery({ queryKey: ["reports", "today"], queryFn: () => ReportsAPI.today() });
  const monthlyQ = useQuery({ queryKey: ["reports", "month"], queryFn: () => ReportsAPI.thisMonth() });
  const stocksQ = useQuery({ queryKey: ["stocks"], queryFn: () => StocksAPI.list() });
  const txQ = useQuery({ queryKey: ["transactions", "today"], queryFn: () => TransactionsAPI.today() });

  const lowStock = (productsQ.data ?? []).filter(
    (p) => Number(p.minimumQuantity) > 0,
  ).length;
  const pendingStock = (stocksQ.data ?? []).filter((s) => s.status === "PENDING").length;

  const stats = [
    {
      label: "Total Products",
      value: productsQ.data ? String(productsQ.data.length) : "—",
      icon: Package,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Sales Today",
      value: dailyQ.data ? String(dailyQ.data.numberOfTransactions) : "—",
      icon: ShoppingCart,
      tint: "bg-info/10 text-info",
    },
    {
      label: "Revenue Today (KSh)",
      value: dailyQ.data ? Number(dailyQ.data.totalSales).toLocaleString() : "—",
      icon: DollarSign,
      tint: "bg-success/10 text-success",
    },
    {
      label: "Low Stock Items",
      value: String(lowStock),
      icon: AlertTriangle,
      tint: "bg-warning/10 text-warning",
    },
    {
      label: "Pending Requests",
      value: String(pendingStock),
      icon: ClipboardList,
      tint: "bg-accent text-accent-foreground",
    },
  ];

  // Build a simple "items sold" chart from today's report
  const todaySeries = (dailyQ.data?.itemsSoldList ?? []).map((i) => ({
    name: i.productName,
    qty: i.quantitySold,
  }));

  const monthShare = (monthlyQ.data?.mostSoldItem ?? []).slice(0, 6).map((i) => ({
    name: i.productName,
    value: i.quantitySold,
  }));

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
                  <ArrowUpRight className="h-3 w-3" />
                  live
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
              <CardTitle>Items sold today</CardTitle>
              <CardDescription>{dailyQ.data?.date ?? "Loading…"}</CardDescription>
            </div>
            <Badge variant="secondary">Today</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              {dailyQ.isLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : todaySeries.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No sales today yet.</div>
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={todaySeries} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="qty" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top products this month</CardTitle>
            <CardDescription>Units sold share</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {monthShare.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet.</div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={monthShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {monthShare.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
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
                <TableHead>Cashier</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total (KSh)</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(txQ.data ?? []).slice(0, 8).map((t) => (
                <TableRow key={t.Id}>
                  <TableCell className="font-medium">#{t.transactionId}</TableCell>
                  <TableCell>{t.cashierName}</TableCell>
                  <TableCell className="text-right">{t.items.length}</TableCell>
                  <TableCell className="text-right font-semibold">{Number(t.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={t.paymentMethod === "MPESA" ? "default" : "secondary"}>{t.paymentMethod}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(txQ.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    {txQ.isLoading ? "Loading transactions…" : "No transactions yet today."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
