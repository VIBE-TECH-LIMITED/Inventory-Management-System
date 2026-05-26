import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, Banknote, Smartphone, Printer, Package, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ProductsAPI, TransactionsAPI, ApiError, type ProductResponseDto, type PaymentMethod } from "@/lib/api";

export const Route = createFileRoute("/_app/pos")({
  head: () => ({ meta: [{ title: "POS — Quick Save" }] }),
  component: POS,
});

type CartLine = { id: number; name: string; price: number; qty: number };

function POS() {
  const qc = useQueryClient();
  const productsQ = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => ProductsAPI.active(),
  });
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [phone, setPhone] = useState("");

  const list = useMemo(() => {
    const items = productsQ.data ?? [];
    return items
      .filter((p) => p.productName.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 12);
  }, [productsQ.data, q]);

  const add = (p: ProductResponseDto) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === p.Id);
      if (ex) return c.map((x) => (x.id === p.Id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { id: p.Id, name: p.productName, price: Number(p.sellingPrice), qty: 1 }];
    });
  };
  const dec = (id: number) =>
    setCart((c) => c.flatMap((x) => (x.id === id ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x])));
  const inc = (id: number) => setCart((c) => c.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  const remove = (id: number) => setCart((c) => c.filter((x) => x.id !== id));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  const checkoutMut = useMutation({
    mutationFn: (method: PaymentMethod) =>
      TransactionsAPI.create({
        items: cart.map((l) => ({ productId: l.id, quantity: l.qty })),
        paymentMethod: method,
        phoneNumber: method === "MPESA" ? phone : undefined,
      }),
    onSuccess: (res, method) => {
      toast.success(`Payment received via ${method} — KSh ${Number(res.totalAmount).toLocaleString()}`);
      setCart([]);
      setPhone("");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Checkout failed"),
  });

  const checkout = (method: PaymentMethod) => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (method === "MPESA" && !/^(07|01)\d{8}$/.test(phone)) {
      return toast.error("Enter a valid M-Pesa phone number");
    }
    checkoutMut.mutate(method);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-sm text-muted-foreground">Scan, search and add products to the cart.</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Scan barcode or search product…"
                className="h-12 pl-10 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {productsQ.isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading products…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => (
              <button
                key={p.Id}
                onClick={() => add(p)}
                className="group rounded-xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-20 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Package className="h-7 w-7" />
                </div>
                <div className="mt-2 text-sm font-medium leading-tight line-clamp-2">{p.productName}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">KSh {Number(p.sellingPrice).toLocaleString()}</span>
                  <Badge variant="outline" className="text-[10px]">#{p.Id}</Badge>
                </div>
              </button>
            ))}
            {list.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                No products available.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart */}
      <Card className="lg:sticky lg:top-20 lg:h-fit">
        <CardHeader>
          <CardTitle>Current sale</CardTitle>
          <CardDescription>{cart.length} item{cart.length !== 1 && "s"} in cart</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-72 rounded-lg border">
            {cart.length === 0 ? (
              <div className="flex h-full items-center justify-center p-10 text-sm text-muted-foreground">
                Cart is empty
              </div>
            ) : (
              <ul className="divide-y">
                {cart.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">KSh {l.price} × {l.qty}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => dec(l.id)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{l.qty}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => inc(l.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="w-20 text-right text-sm font-semibold">
                      {(l.price * l.qty).toLocaleString()}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(l.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>KSh {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (16%)</span><span>KSh {tax.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-primary">KSh {total.toLocaleString()}</span>
            </div>
          </div>

          <Input
            placeholder="M-Pesa phone (07… or 01…)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => checkout("CASH")} variant="outline" size="lg" disabled={checkoutMut.isPending}>
              <Banknote className="h-4 w-4" /> Cash
            </Button>
            <Button onClick={() => checkout("MPESA")} size="lg" disabled={checkoutMut.isPending}>
              {checkoutMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
              M-Pesa
            </Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={() => toast.info("Receipt sent to printer")}>
            <Printer className="h-4 w-4" /> Preview receipt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
