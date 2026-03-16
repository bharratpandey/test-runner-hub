import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TestRun {
  id: string;
  test_name: string | null;
  requirement_name: string | null;
  test_email: string | null;
  test_password: string | null;
  logs: string | null;
  status: string | null;
  updated_at: string | null;
}

export function useTestRun() {
  const [activeRun, setActiveRun] = useState<TestRun | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to realtime updates on the active run
  useEffect(() => {
    if (!activeRun?.id) return;

    const channel = supabase
      .channel(`test_run_${activeRun.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "test_runs",
          filter: `id=eq.${activeRun.id}`,
        },
        (payload) => {
          const updated = payload.new as TestRun;
          setActiveRun(updated);
          if (updated.status === "pass" || updated.status === "fail" || updated.status === "error") {
            setIsLive(false);
          }
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRun?.id]);

  // Auto-scroll when logs change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeRun?.logs]);

  const startRun = useCallback(async (testId: string, testName: string) => {
    // Clear previous run
    setActiveRun(null);
    setIsLive(true);

    // Insert a new test_run record
    const { data, error } = await supabase
      .from("test_runs")
      .insert({
        test_name: testId,
        requirement_name: testName,
        status: "running",
        logs: "",
      })
      .select()
      .single();

    if (data) {
      setActiveRun(data as TestRun);
    }

    // Trigger edge function
    await supabase.functions.invoke("trigger-test", {
      body: { test_id: testId, run_id: data?.id },
    });

    return { data, error };
  }, []);

  const closeLivePanel = useCallback(() => {
    setIsLive(false);
    setActiveRun(null);
  }, []);

  const copyLogs = useCallback(() => {
    if (activeRun?.logs) {
      navigator.clipboard.writeText(activeRun.logs);
    }
  }, [activeRun?.logs]);

  const downloadCsv = useCallback(() => {
    if (!activeRun) return;
    const lines = activeRun.logs?.split("\n") || [];
    const csvContent = [
      "timestamp,message",
      ...lines.map((line, i) => `"${i}","${line.replace(/"/g, '""')}"`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeRun.test_name || "test"}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeRun]);

  return {
    activeRun,
    isLive,
    isSubscribed,
    bottomRef,
    startRun,
    closeLivePanel,
    copyLogs,
    downloadCsv,
  };
}
