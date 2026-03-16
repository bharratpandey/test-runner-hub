import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SubTest {
  label: string;
  id: string;
}

interface TestCardProps {
  title: string;
  icon: React.ReactNode;
  subTests: SubTest[];
  onTriggerTest: (testId: string, testName: string) => Promise<void>;
}

export function TestCard({ title, icon, subTests, onTriggerTest }: TestCardProps) {
  const [runningId, setRunningId] = useState<string | null>(null);
  const { toast } = useToast();

  const triggerTest = async (testId: string, label: string) => {
    setRunningId(testId);
    try {
      await onTriggerTest(testId, label);
      toast({ title: "Test triggered", description: `Started: ${label}` });
    } catch (e: any) {
      toast({
        title: "Trigger failed",
        description: e.message || "Edge function not configured yet.",
        variant: "destructive",
      });
    } finally {
      setRunningId(null);
    }
  };

  const runAll = async () => {
    for (const sub of subTests) {
      await triggerTest(sub.id, sub.label);
    }
  };

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={runAll}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold min-h-[44px]"
          size="lg"
          disabled={runningId !== null}
        >
          {runningId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Run All
        </Button>
        <div className="grid grid-cols-1 gap-1.5">
          {subTests.map((sub) => (
            <Button
              key={sub.id}
              variant="secondary"
              size="sm"
              className="justify-start text-xs font-mono min-h-[44px]"
              onClick={() => triggerTest(sub.id, sub.label)}
              disabled={runningId !== null}
            >
              {runningId === sub.id ? (
                <Loader2 className="h-3 w-3 animate-spin mr-2 shrink-0" />
              ) : (
                <Play className="h-3 w-3 mr-2 shrink-0" />
              )}
              {sub.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
