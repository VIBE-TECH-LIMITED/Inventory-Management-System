import { createFileRoute } from "@tanstack/react-router";
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
  ArrowDownRight,
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
import { salesByDay, categoryShare, transactions } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Quick Save" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Total Products", value: "1,284", delta: "+24", up: true, icon: Package, tint: "bg-primary/10 text-primary" },
  { label: "Sales Today", value: "342", delta: "+12.4%", up: true, icon: ShoppingCart, tint: "bg-info/10 text-info" },
  { label: "Revenue (KSh)", value: "91,500", delta: "+8.2%", up: true, icon: DollarSign, tint: "bg-success/10 text-success" },
  { label: "Low Stock", value: "17", delta: "+3", up: false, icon: AlertTriangle, tint: "bg-warning/10 text-warning" },
  { label: "Pending Requests", value: "6", delta: "-2", up: true, icon: ClipboardList, tint: "bg-accent text-accent-foreground" },
];

const pieColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-muted-foreground)"];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Live overview of your store performance — Monday, 25 May.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><Plus className="h-4 w-4" /> Add Product</Button>
          <Button variant="outline"><ScanBarcode className="h-4 w-4" /> New Sale</Button>
          <Button><FileBarChart className="h-4 w-4" /> Export Report</Button>
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
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${s.up ? "text-success" : "text-destructive"}`}>
                  {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {s.delta}
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
              <CardTitle>Sales analytics</CardTitle>
              <CardDescription>Weekly revenue (KSh) and orders</CardDescription>
            </div>
            <Badge variant="secondary">Last 7 days</Badge>
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
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category share</CardTitle>
            <CardDescription>Revenue by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryShare}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {categoryShare.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
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
            <CardDescription>Latest sales across all registers</CardDescription>
          </div>
          <Button variant="outline" size="sm">View all</Button>
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
