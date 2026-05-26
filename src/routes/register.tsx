import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBasket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthAPI, ApiError } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Quick Save" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthAPI.register(form);
      toast.success(res.message || "Account created");
      nav({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBasket className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold">Quick Save</div>
            <div className="text-xs text-muted-foreground">Create your account</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
        <p className="mt-1 text-sm text-muted-foreground">It only takes a minute.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fn">First name</Label>
              <Input id="fn" value={form.firstName} onChange={upd("firstName")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ln">Last name</Label>
              <Input id="ln" value={form.lastName} onChange={upd("lastName")} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="em">Email</Label>
            <Input id="em" type="email" value={form.email} onChange={upd("email")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ph">Phone (07… or 01…)</Label>
            <Input id="ph" value={form.phoneNumber} onChange={upd("phoneNumber")} placeholder="0712345678" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" value={form.password} onChange={upd("password")} required />
            <p className="text-[11px] text-muted-foreground">
              Min 8 chars, one uppercase, one number, one special character.
            </p>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
