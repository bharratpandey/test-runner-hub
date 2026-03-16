import { Copy, Terminal, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTestLogs } from "@/hooks/useTestLogs";
import { useToast } from "@/hooks/use-toast";

interface LogTerminalProps {
  className?: string;
}

export function LogTerminal({ className }: LogTerminalProps) {
  const { logs, isSubscribed, copyLogs, bottomRef } = useTestLogs();
  const { toast } = useToast();

  const handleCopy = () => {
    copyLogs();
    toast({ title: "Copied!", description: "Logs copied to clipboard." });
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "pass":
      case "success":
        return "text-success";
      case "fail":
      case "error":
        return "text-destructive";
      case "running":
      case "info":
        return "text-accent";
      default:
        return "text-terminal-foreground";
    }
  };

  return (
    <div className={`bg-terminal rounded-lg border border-border overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-terminal">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-terminal-foreground" />
          <span className="font-mono text-xs text-terminal-foreground font-semibold tracking-wider uppercase">
            Log Stream
          </span>
          <div className="flex gap-1 ml-2">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <Wifi className="h-3.5 w-3.5 text-success animate-pulse-glow" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-destructive" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-terminal-muted hover:text-terminal-foreground hover:bg-secondary/10"
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs font-mono">Copy</span>
          </Button>
        </div>
      </div>

      {/* Log Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed terminal-scrollbar min-h-[200px] max-h-[400px] lg:max-h-[500px]">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-terminal-muted">
            <span className="animate-pulse-glow">Waiting for logs...</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-2 py-0.5 hover:bg-secondary/5 rounded px-1">
              <span className="text-terminal-muted shrink-0">
                {log.created_at
                  ? new Date(log.created_at).toLocaleTimeString("en-US", { hour12: false })
                  : "--:--:--"}
              </span>
              <span className={`shrink-0 font-semibold uppercase w-12 text-right ${getStatusColor(log.status)}`}>
                {log.status ?? "???"}
              </span>
              <span className="text-accent shrink-0">{log.test_name}</span>
              <span className="text-terminal-foreground">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
