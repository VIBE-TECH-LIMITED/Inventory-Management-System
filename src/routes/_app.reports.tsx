import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, FileSpreadsheet } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { salesByDay, topProducts } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — Quick Save" }] }),
  component: Reports,
});

const monthly = [
  { m: "Jan", sales: 1240000 }, { m: "Feb", sales: 1380000 }, { m: "Mar", sales: 1510000 },
  { m: "Apr", sales: 1420000 }, { m: "May", sales: 1670000 }, { m: "Jun", sales: 1820000 },
  { m: "Jul", sales: 1755000 }, { m: "Aug", sales: 1910000 }, { m: "Sep", sales: 2050000 },
  { m: "Oct", sales: 2180000 }, { m: "Nov", sales: 2360000 }, { m: "Dec", sales: 2580000 },
];

function Reports() {
  const totalWeek = salesByDay.reduce((s, d) => s + d.sales, 0);
  const totalOrders = salesByDay.reduce((s, d) => s + d.orders, 0);

  const kpis = [
    { l: "Revenue (week)", v: `KSh ${totalWeek.toLocaleString()}`, s: "+12.4% vs last week" },
    { l: "Orders", v: totalOrders.toLocaleString(), s: "+8.1% vs last week" },
    { l: "Avg basket", v: `KSh ${Math.round(totalWeek / totalOrders).toLocaleString()}`, s: "+3.2%" },
    { l: "Best day", v: "Saturday", s: "KSh 91,500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Track sales, revenue and best-sellers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Exported to Excel")}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button onClick={() => toast.success("Exported to PDF")}>
            <FileDown className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.l}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{k.l}</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">{k.v}</div>
              <div className="mt-1 text-xs text-success">{k.s}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="top">Top products</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Sales this week</CardTitle>
              <CardDescription>Revenue (KSh) per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer>
                  <BarChart data={salesByDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly trend</CardTitle>
              <CardDescription>Revenue over the past 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer>
                  <LineChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Top selling products</CardTitle>
              <CardDescription>Ranked by units sold this month</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Units sold</TableHead>
                    <TableHead className="text-right">Revenue (KSh)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p, i) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-semibold text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{p.sold.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">{p.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
