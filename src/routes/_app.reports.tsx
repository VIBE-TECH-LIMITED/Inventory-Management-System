import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ReportsAPI } from "@/lib/api";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — Quick Save" }] }),
  component: Reports,
});

function Reports() {
  const dailyQ = useQuery({ queryKey: ["reports", "today"], queryFn: () => ReportsAPI.today() });
  const monthlyQ = useQuery({ queryKey: ["reports", "month"], queryFn: () => ReportsAPI.thisMonth() });

  const daily = dailyQ.data;
  const monthly = monthlyQ.data;

  const kpis = [
    {
      l: "Revenue (today)",
      v: daily ? `KSh ${Number(daily.totalSales).toLocaleString()}` : "—",
      s: daily ? `${daily.numberOfTransactions} transactions` : "",
    },
    {
      l: `Revenue (${monthly?.month ?? "month"})`,
      v: monthly ? `KSh ${Number(monthly.totalSales).toLocaleString()}` : "—",
      s: monthly ? `${monthly.numberOfTransactions} orders` : "",
    },
    {
      l: "Profit (month)",
      v: monthly ? `KSh ${Number(monthly.profit).toLocaleString()}` : "—",
      s: monthly ? `Loss: KSh ${Number(monthly.loss).toLocaleString()}` : "",
    },
    {
      l: "Items sold today",
      v: daily ? String(daily.itemsSoldList.reduce((s, i) => s + i.quantitySold, 0)) : "—",
      s: daily ? `${daily.itemsSoldList.length} distinct SKUs` : "",
    },
  ];

  const topToday = daily?.itemsSoldList ?? [];
  const topMonth = monthly?.mostSoldItem ?? [];

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
          <TabsTrigger value="daily">Today's items</TabsTrigger>
          <TabsTrigger value="monthly">Monthly top</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Items sold today</CardTitle>
              <CardDescription>{daily?.date ?? ""}</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : topToday.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No sales today yet.</div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer>
                    <BarChart data={topToday} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="productName" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="quantitySold" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Top selling — {monthly?.month ?? ""}</CardTitle>
              <CardDescription>Ranked by units sold this month</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {monthlyQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Units sold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topMonth.map((p, i) => (
                      <TableRow key={p.productName}>
                        <TableCell className="font-semibold text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{p.productName}</TableCell>
                        <TableCell className="text-right">{p.quantitySold.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {topMonth.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                          No data for this month yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
