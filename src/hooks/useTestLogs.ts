import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type TestLog = Tables<"test_runs">;

export function useTestLogs() {
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch existing logs
  const fetchLogs = useCallback(async () => {
    const { data } = await supabase
      .from("test_runs")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setLogs(data);
  }, []);

  // Clear logs from UI and DB
  const clearLogs = useCallback(async () => {
    setLogs([]);
    await supabase.from("test_runs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }, []);

  // Copy logs to clipboard
  const copyLogs = useCallback(() => {
    const text = logs
      .map((l) => `[${l.created_at}] [${l.status}] ${l.test_name}: ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  }, [logs]);

  // Subscribe to realtime
  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel("test_runs_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "test_runs" },
        (payload) => {
          setLogs((prev) => [...prev, payload.new as TestLog]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "test_runs" },
        () => {
          // When records are deleted, clear local state too
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return { logs, isSubscribed, clearLogs, copyLogs, bottomRef };
}
