import { X, Copy, Download, Terminal, Wifi, WifiOff, Key, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { TestRun } from "@/hooks/useTestRun";

interface LiveExecutionPanelProps {
  run: TestRun | null;
  isLive: boolean;
  isSubscribed: boolean;
  bottomRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onCopyLogs: () => void;
  onDownloadCsv: () => void;
}

export function LiveExecutionPanel({
  run,
  isLive,
  isSubscribed,
  bottomRef,
  onClose,
  onCopyLogs,
  onDownloadCsv,
}: LiveExecutionPanelProps) {
  const { toast } = useToast();

  if (!run && !isLive) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "bg-warning/20 text-warning";
      case "pass":
      case "success":
        return "bg-success/20 text-success";
      case "fail":
      case "error":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const logLines = run?.logs?.split("\n").filter(Boolean) || [];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">
                {run?.requirement_name || "Pending..."}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">{run?.test_name}</p>
            </div>
            {run?.status && (
              <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full uppercase shrink-0 ${getStatusBadge(run.status)}`}>
                {isLive && run.status === "running" ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse-glow" />
                    Live
                  </span>
                ) : (
                  run.status
                )}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Credentials */}
        <div className="px-5 py-3 border-b border-border flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Key className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Email:</span>
            <code className="text-xs font-mono text-foreground bg-muted px-2 py-0.5 rounded">
              {run?.test_email || "..."}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => copyToClipboard(run?.test_email || "", "Email")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Key className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Password:</span>
            <code className="text-xs font-mono text-foreground bg-muted px-2 py-0.5 rounded">
              {run?.test_password || "..."}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => copyToClipboard(run?.test_password || "", "Password")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Terminal */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2 bg-terminal border-b border-border">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-terminal-foreground" />
              <span className="font-mono text-xs text-terminal-foreground font-semibold tracking-wider uppercase">
                Terminal
              </span>
              <div className="flex gap-1 ml-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div className="w-2 h-2 rounded-full bg-warning" />
                <div className="w-2 h-2 rounded-full bg-success" />
              </div>
            </div>
            {isSubscribed ? (
              <Wifi className="h-3.5 w-3.5 text-success animate-pulse-glow" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-destructive" />
            )}
          </div>
          <div className="flex-1 overflow-y-auto bg-terminal p-4 font-mono text-xs leading-relaxed terminal-scrollbar min-h-[200px] max-h-[50vh]">
            {logLines.length === 0 ? (
              <div className="flex items-center justify-center h-full text-terminal-muted">
                <span className="animate-pulse-glow">Waiting for logs...</span>
              </div>
            ) : (
              logLines.map((line, idx) => (
                <div key={idx} className="py-0.5 text-terminal-foreground hover:bg-secondary/5 rounded px-1">
                  <span className="text-terminal-muted mr-2">{String(idx + 1).padStart(3, "0")}</span>
                  {line}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-border bg-card">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onCopyLogs();
              toast({ title: "Copied!", description: "All logs copied to clipboard." });
            }}
            className="font-mono text-xs"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy All Logs
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDownloadCsv}
            className="font-mono text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download CSV Report
          </Button>
        </div>
      </div>
    </div>
  );
}
