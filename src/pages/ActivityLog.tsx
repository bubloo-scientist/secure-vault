import { useCallback, useEffect, useState } from "react";
import { Clock, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  ip: string;
  status: "success" | "denied" | "warning";
}

const actionStatus: Record<string, "success" | "denied" | "warning"> = {
  ACCESS_DENIED: "denied",
  LOGIN_FAILED: "denied",
  CHECKSUM_WARN: "warning",
};

const statusColors: Record<string, string> = {
  success: "text-status-success",
  denied: "text-destructive",
  warning: "text-status-warning",
};

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const [{ data: logData, error: logError }, { data: profiles, error: profileError }] = await Promise.all([
        supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("profiles").select("id, full_name, email"),
      ]);

      if (logError) throw logError;
      if (profileError) throw profileError;

      const profileMap = new Map(
        (profiles || []).map((profile) => [profile.id, profile.full_name || profile.email || "system"])
      );

      setLogs(
        (logData || []).map((row) => ({
          id: row.id,
          timestamp: new Date(row.created_at).toLocaleString(),
          action: row.action,
          user: row.user_id ? profileMap.get(row.user_id) || "system" : "system",
          details: row.details || "—",
          ip: row.ip_address || "—",
          status: actionStatus[row.action] || "success",
        }))
      );
    } catch (error) {
      console.error("Error fetching activity log:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLogs();

    const channel = supabase
      .channel("activity-log-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        () => void fetchLogs()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Activity Log</h1>
          <p className="text-sm text-muted-foreground">Audit trail of all system actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-8 px-3 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors duration-150">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
            Filter
          </button>
          <button className="flex items-center gap-2 h-8 px-3 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors duration-150">
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Timestamp</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Action</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">User</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Details</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">IP Address</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-sm text-muted-foreground">Loading activity…</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <Clock className="w-5 h-5 mx-auto text-muted-foreground/40 mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Actions will appear here as your team uses the system.</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors duration-150">
                  <td className="px-4 py-2 text-xs font-mono-data text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] font-mono-data font-medium ${statusColors[log.status]}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm font-mono-data text-foreground">{log.user}</td>
                  <td className="px-4 py-2 text-sm font-mono-data text-muted-foreground truncate max-w-xs">{log.details}</td>
                  <td className="px-4 py-2 text-xs font-mono-data text-muted-foreground">{log.ip}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] font-medium uppercase ${statusColors[log.status]}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Showing {logs.length} entries</span>
        </div>
      </div>
    </div>
  );
}
