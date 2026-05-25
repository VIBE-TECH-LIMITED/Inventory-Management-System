import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, Banknote, Smartphone, Printer, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/pos")({
  head: () => ({ meta: [{ title: "POS — Quick Save" }] }),
  component: POS,
});

type CartLine = { id: string; name: string; price: number; qty: number };

function POS() {
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([
    { id: "P001", name: "Coca-Cola 500ml", price: 80, qty: 2 },
    { id: "P003", name: "Supa Loaf 400g", price: 65, qty: 1 },
  ]);

  const list = useMemo(
    () =>
      products
        .filter((p) => p.stock > 0)
        .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 12),
    [q],
  );

  const add = (p: (typeof products)[number]) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === p.id);
      if (ex) return c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };
  const dec = (id: string) =>
    setCart((c) => c.flatMap((x) => (x.id === id ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x])));
  const inc = (id: string) => setCart((c) => c.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  const remove = (id: string) => setCart((c) => c.filter((x) => x.id !== id));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  const checkout = (method: "Cash" | "M-Pesa") => {
    if (cart.length === 0) return toast.error("Cart is empty");
    toast.success(`Payment received via ${method} — KSh ${total.toLocaleString()}`);
    setCart([]);
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => add(p)}
              className="group rounded-xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex h-20 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Package className="h-7 w-7" />
              </div>
              <div className="mt-2 text-sm font-medium leading-tight line-clamp-2">{p.name}</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-bold text-primary">KSh {p.price}</span>
                <Badge variant="outline" className="text-[10px]">{p.stock}</Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <Card className="lg:sticky lg:top-20 lg:h-fit">
        <CardHeader>
          <CardTitle>Current sale</CardTitle>
          <CardDescription>Receipt #TX-{10232 + cart.length}</CardDescription>
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

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => checkout("Cash")} variant="outline" size="lg">
              <Banknote className="h-4 w-4" /> Cash
            </Button>
            <Button onClick={() => checkout("M-Pesa")} size="lg">
              <Smartphone className="h-4 w-4" /> M-Pesa
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
