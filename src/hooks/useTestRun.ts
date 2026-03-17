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

  // Subscribe to realtime updates on the active run from Supabase
  // Inside useTestRun hook
  useEffect(() => {
      if (!activeRun?.id) return;

      const channel = supabase
        .channel(`test_run_${activeRun.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "test_runs", // <--- Change this to test_runs
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

  // Auto-scroll the log terminal when new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeRun?.logs]);

  const startRun = useCallback(async (testId: string, testName: string) => {
    // Clear previous UI state
    setActiveRun(null);
    setIsLive(true);

    // 1. Create a tracking record in your Supabase 'test_runs' table
    const { data, error } = await supabase
      .from("test_runs")
      .insert({
        test_name: testId,        // Sent to GitHub to run specific Java class
        requirement_name: testName,
        status: "running",
        logs: "🚀 Initializing GitHub Action...\n",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      setIsLive(false);
      return { data, error };
    }

    if (data) {
      setActiveRun(data as TestRun);
    }

    // 2. Trigger the GitHub Action in EMB-RA-Automation
    try {
      const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
      const GITHUB_OWNER = "bharratpandey";
      const GITHUB_REPO = "EMB-RA-Automation";

      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            event_type: "manual-test-trigger", // Must match your .yml workflow trigger
            client_payload: {
              test_name: testId,
              run_id: data?.id, // Useful if you want the Java test to update THIS specific row
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub responded with ${response.status}`);
      }
    } catch (err: any) {
      console.error("GitHub Trigger Error:", err);
      // Update Supabase logs so the user sees the connection failed
      await supabase
        .from("test_runs")
        .update({
            logs: `❌ Error: Could not reach GitHub. ${err.message}`,
            status: "error"
        })
        .eq("id", data?.id);
    }

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