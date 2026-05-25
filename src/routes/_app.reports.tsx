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
  Legend,
} from "recharts";
import { salesByDay, topProducts } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — Quick Save" }] }),
  component: Reports,
});

const monthly = [
  { m: "Jan", revenue: 1.42, profit: 0.32 },
  { m: "Feb", revenue: 1.61, profit: 0.38 },
  { m: "Mar", revenue: 1.82, profit: 0.44 },
  { m: "Apr", revenue: 2.05, profit: 0.51 },
  { m: "May", revenue: 2.31, profit: 0.59 },
];

function Reports() {
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
        {[
          { l: "Revenue (May)", v: "KSh 2.31M", s: "+12.6% vs Apr" },
          { l: "Profit estimate", v: "KSh 590K", s: "Margin 25.5%" },
          { l: "Avg. order", v: "KSh 318", s: "+4.1%" },
          { l: "Orders served", v: "7,261", s: "+9.2%" },
        ].map((k) => (
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
          <TabsTrigger value="daily">Daily sales</TabsTrigger>
          <TabsTrigger value="monthly">Monthly report</TabsTrigger>
          <TabsTrigger value="top">Top products</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily sales (last 7 days)</CardTitle>
              <CardDescription>Revenue per day in KSh</CardDescription>
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
              <CardTitle>Revenue & profit (KSh Millions)</CardTitle>
              <CardDescription>Trailing 5 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer>
                  <LineChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="profit" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Top-selling products</CardTitle>
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
