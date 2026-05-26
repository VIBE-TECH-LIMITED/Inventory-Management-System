import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ProductsAPI,
  CategoriesAPI,
  ApiError,
  type ProductResponseDto,
  type ProductDto,
} from "@/lib/api";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Products — Quick Save" }] }),
  component: ProductsPage,
});

type FormState = {
  productName: string;
  description: string;
  sellingPrice: string;
  minimumQuantity: string;
  supplierId: string;
  categoryId: string;
};
const emptyForm: FormState = {
  productName: "",
  description: "",
  sellingPrice: "",
  minimumQuantity: "",
  supplierId: "",
  categoryId: "",
};

function ProductsPage() {
  const qc = useQueryClient();
  const productsQ = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => ProductsAPI.active(),
  });
  const categoriesQ = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoriesAPI.list(),
  });

  const [q, setQ] = useState("");
  const [catId, setCatId] = useState<string>("all");
  const [toDelete, setToDelete] = useState<ProductResponseDto | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductResponseDto | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const items = productsQ.data ?? [];
  const categories = categoriesQ.data ?? [];

  const catName = (id: number) =>
    categories.find((c) => c.id === id)?.categoryName ?? `#${id}`;

  const filtered = useMemo(
    () =>
      items.filter(
        (p) =>
          (catId === "all" || String(p.categoryId) === catId) &&
          p.productName.toLowerCase().includes(q.toLowerCase()),
      ),
    [items, q, catId],
  );

  const removeMut = useMutation({
    mutationFn: (id: number) => ProductsAPI.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      setToDelete(null);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Delete failed"),
  });

  const saveMut = useMutation({
    mutationFn: async (payload: ProductDto) => {
      return editing
        ? ProductsAPI.update(editing.Id, payload)
        : ProductsAPI.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(editing ? "Product updated" : "Product created");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Save failed"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (p: ProductResponseDto) => {
    setEditing(p);
    setForm({
      productName: p.productName,
      description: p.description ?? "",
      sellingPrice: String(p.sellingPrice),
      minimumQuantity: String(p.minimumQuantity),
      supplierId: String(p.supplierId),
      categoryId: String(p.categoryId),
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMut.mutate({
      productName: form.productName.trim(),
      description: form.description.trim() || undefined,
      sellingPrice: Number(form.sellingPrice),
      minimumQuantity: Number(form.minimumQuantity),
      supplierId: Number(form.supplierId),
      categoryId: Number(form.categoryId),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inventory catalogue.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Catalogue</CardTitle>
            <CardDescription>
              {filtered.length} of {items.length} products
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name"
                className="pl-9 sm:w-72"
              />
            </div>
            <Select value={catId} onValueChange={setCatId}>
              <SelectTrigger className="sm:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {productsQ.isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading products…
            </div>
          ) : productsQ.isError ? (
            <div className="py-10 text-center text-sm text-destructive">
              {(productsQ.error as Error).message}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price (KSh)</TableHead>
                  <TableHead className="text-right">Min. Qty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.Id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{p.productName}</div>
                          <div className="line-clamp-1 text-xs text-muted-foreground">
                            {p.description || `#${p.Id}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{catName(p.categoryId)}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {Number(p.sellingPrice).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.minimumQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToDelete(p)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No products match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update product details." : "Create a new product in your catalogue."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="pn">Product name</Label>
              <Input
                id="pn"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sp">Selling price</Label>
                <Input
                  id="sp"
                  type="number"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mq">Minimum quantity</Label>
                <Input
                  id="mq"
                  type="number"
                  step="0.01"
                  value={form.minimumQuantity}
                  onChange={(e) => setForm({ ...form, minimumQuantity: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cat">Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger id="cat">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sup">Supplier ID</Label>
                <Input
                  id="sup"
                  type="number"
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMut.isPending}>
                {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Create product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{toDelete?.productName}</strong> from your catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && removeMut.mutate(toDelete.Id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
