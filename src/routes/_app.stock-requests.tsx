import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { StocksAPI, ApiError, type StockStatus, type StockResponseDto } from "@/lib/api";

export const Route = createFileRoute("/_app/stock-requests")({
  head: () => ({ meta: [{ title: "Stock Requests — Quick Save" }] }),
  component: StockRequests,
});

function statusBadge(s: StockStatus) {
  if (s === "APPROVED") return <Badge className="bg-success text-success-foreground hover:bg-success/90">Approved</Badge>;
  if (s === "REJECTED") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">Pending</Badge>;
}

function StockRequests() {
  const qc = useQueryClient();
  const stocksQ = useQuery({
    queryKey: ["stocks"],
    queryFn: () => StocksAPI.list(),
  });

  const actMut = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "approve" | "reject" }) =>
      action === "approve" ? StocksAPI.approve(id) : StocksAPI.reject(id),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
      toast.success(`Stock #${v.id} ${v.action === "approve" ? "approved" : "rejected"}`);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Action failed"),
  });

  const rows = stocksQ.data ?? [];
  const pending = rows.filter((r) => r.status === "PENDING");
  const history = rows.filter((r) => r.status !== "PENDING");

  const renderRow = (r: StockResponseDto, withActions: boolean) => (
    <TableRow key={r.Id}>
      <TableCell className="font-medium">#{r.Id}</TableCell>
      <TableCell>Product #{r.productId}</TableCell>
      <TableCell className="text-right">{r.arrivedQuantity}</TableCell>
      <TableCell>{r.supplierName}</TableCell>
      <TableCell>{r.addedByName}</TableCell>
      <TableCell>{r.approvedDate ?? "—"}</TableCell>
      <TableCell>{statusBadge(r.status)}</TableCell>
      {withActions && (
        <TableCell className="text-right">
          <div className="inline-flex gap-2">
            <Button size="sm" disabled={actMut.isPending} onClick={() => actMut.mutate({ id: r.Id, action: "approve" })}>
              <Check className="h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="outline" disabled={actMut.isPending} onClick={() => actMut.mutate({ id: r.Id, action: "reject" })}>
              <X className="h-4 w-4" /> Reject
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Requests</h1>
          <p className="text-sm text-muted-foreground">Approve or reject incoming restock requests.</p>
        </div>
      </div>

      {stocksQ.isLoading && (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading stock requests…
        </div>
      )}

      {stocksQ.isError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {(stocksQ.error as Error).message}
        </div>
      )}

      {!stocksQ.isLoading && !stocksQ.isError && (
        <>
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
                    <TableHead>Supplier</TableHead>
                    <TableHead>Added by</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((r) => renderRow(r, true))}
                  {pending.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
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
                    <TableHead>Supplier</TableHead>
                    <TableHead>Added by</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((r) => renderRow(r, false))}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No history yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
