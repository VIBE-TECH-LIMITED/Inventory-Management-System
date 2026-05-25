import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Info, XCircle, BellRing } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Quick Save" }] }),
  component: Notifications,
});

const tone = {
  danger: { icon: XCircle, cls: "bg-destructive/10 text-destructive" },
  warning: { icon: AlertTriangle, cls: "bg-warning/15 text-warning" },
  info: { icon: Info, cls: "bg-info/10 text-info" },
  success: { icon: CheckCircle2, cls: "bg-success/10 text-success" },
} as const;

function Notifications() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Real-time alerts across your stores.</p>
        </div>
        <Button variant="outline"><BellRing className="h-4 w-4" /> Mark all as read</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity feed</CardTitle>
          <CardDescription>{notifications.length} recent updates</CardDescription>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {notifications.map((n) => {
            const t = tone[n.type];
            const Icon = t.icon;
            return (
              <div key={n.id} className="flex items-start gap-4 p-4 hover:bg-muted/40">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", t.cls)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    <Badge variant="outline" className="capitalize">{n.type}</Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{n.time}</div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
