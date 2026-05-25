import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingBasket, Loader2, ShieldCheck, TrendingUp, Boxes } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Quick Save" },
      { name: "description", content: "Smart Inventory & Sales Management for modern retail." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@quicksave.co.ke");
  const [password, setPassword] = useState("demo1234");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("qs_token", "demo.jwt.token");
      toast.success("Welcome back to Quick Save");
      nav({ to: "/dashboard" });
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.25), transparent 45%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <ShoppingBasket className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">Quick Save</div>
            <div className="text-xs opacity-80">Retail Management Suite</div>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Smart Inventory & Sales Management.
          </h1>
          <p className="max-w-md text-base opacity-90">
            Run your supermarket with confidence. Track stock, process sales, and grow revenue —
            all from one polished dashboard built for modern retail.
          </p>
          <div className="grid max-w-md grid-cols-3 gap-4 pt-2">
            {[
              { icon: Boxes, label: "Live Inventory" },
              { icon: TrendingUp, label: "Sales Analytics" },
              { icon: ShieldCheck, label: "Secure Access" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-white/10 p-3 backdrop-blur">
                <f.icon className="h-5 w-5" />
                <div className="mt-2 text-xs font-medium">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs opacity-70">© {new Date().getFullYear()} Quick Save Technologies, Nairobi.</div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center bg-background p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBasket className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold">Quick Save</div>
              <div className="text-xs text-muted-foreground">Smart Inventory & Sales</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@quicksave.co.ke"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Keep me signed in on this device
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>

            <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Demo access:</span> Use the prefilled
              admin credentials to explore the system.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
