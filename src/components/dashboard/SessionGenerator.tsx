import { Zap, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SessionStatus = "idle" | "generating" | "ready";

export function SessionGenerator() {
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generate = async () => {
    setStatus("generating");
    try {
      await supabase.functions.invoke("trigger-test", {
        body: { test_id: "session-generation" },
      });
      setStatus("ready");
      setLastUpdated(new Date());
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("idle");
    }
  };

  const statusConfig = {
    idle: {
      color: "bg-muted",
      textColor: "text-muted-foreground",
      label: "Idle",
      icon: <Zap className="h-4 w-4" />,
    },
    generating: {
      color: "bg-warning/20",
      textColor: "text-warning",
      label: "Generating...",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    },
    ready: {
      color: "bg-success/20",
      textColor: "text-success",
      label: "Ready",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  };

  const cfg = statusConfig[status];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" />
            Session Generator
          </div>
          {lastUpdated && (
            <span className="text-xs font-normal text-muted-foreground font-mono">
              Last: {lastUpdated.toLocaleTimeString("en-US", { hour12: false })}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${cfg.color}`}>
          {cfg.icon}
          <span className={`text-sm font-mono font-semibold ${cfg.textColor}`}>{cfg.label}</span>
        </div>
        <Button
          onClick={generate}
          disabled={status === "generating"}
          className="w-full bg-warning text-warning-foreground hover:bg-warning/90 font-semibold min-h-[44px]"
          size="lg"
        >
          Generate Session
        </Button>
      </CardContent>
    </Card>
  );
}
