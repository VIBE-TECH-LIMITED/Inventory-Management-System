import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { stockRequests as seed } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/stock-requests")({
  head: () => ({ meta: [{ title: "Stock Requests — Quick Save" }] }),
  component: StockRequests,
});

function statusBadge(s: "pending" | "approved" | "rejected") {
  if (s === "approved") return <Badge className="bg-success text-success-foreground hover:bg-success/90">Approved</Badge>;
  if (s === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">Pending</Badge>;
}

function StockRequests() {
  const [rows, setRows] = useState(seed);

  const act = (id: string, status: "approved" | "rejected") => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Request ${id} ${status}`);
  };

  const pending = rows.filter((r) => r.status === "pending");
  const history = rows.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Requests</h1>
          <p className="text-sm text-muted-foreground">Approve or reject incoming restock requests.</p>
        </div>
        <Button><Plus className="h-4 w-4" /> New request</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
          <CardDescription>{pending.length} awaiting review</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.product}</TableCell>
                  <TableCell className="text-right">{r.qty}</TableCell>
                  <TableCell>{r.by}</TableCell>
                  <TableCell>{r.requested}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button size="sm" onClick={() => act(r.id, "approved")}>
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => act(r.id, "rejected")}>
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pending.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No pending requests. You're all caught up.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request history</CardTitle>
          <CardDescription>Approved and rejected requests</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.product}</TableCell>
                  <TableCell className="text-right">{r.qty}</TableCell>
                  <TableCell>{r.by}</TableCell>
                  <TableCell>{r.requested}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
