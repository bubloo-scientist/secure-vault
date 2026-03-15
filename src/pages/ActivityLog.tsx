import { Clock, Filter, Download } from "lucide-react";

interface LogEntry {
  timestamp: string;
  action: string;
  user: string;
  target: string;
  ip: string;
  status: "success" | "denied" | "warning";
}

const mockLogs: LogEntry[] = [
  { timestamp: "2026-03-15 14:32:08", action: "UPLOAD_COMPLETE", user: "sarah@company.com", target: "/Engineering/Backups/db_dump_0315.sql.gz", ip: "10.0.1.42", status: "success" },
  { timestamp: "2026-03-15 14:28:11", action: "FILE_DOWNLOAD", user: "marcus@company.com", target: "/Finance/Q3_Report.xlsx", ip: "10.0.1.38", status: "success" },
  { timestamp: "2026-03-15 14:15:44", action: "OBJECT_DELETE", user: "admin@company.com", target: "/Temp/old_logs_2024.tar", ip: "10.0.1.1", status: "success" },
  { timestamp: "2026-03-15 13:52:30", action: "USER_PERM_CHANGE", user: "admin@company.com", target: "james@company.com → READ on /Engineering", ip: "10.0.1.1", status: "success" },
  { timestamp: "2026-03-15 13:01:18", action: "ACCESS_DENIED", user: "taylor@company.com", target: "/Engineering/Secrets/api_keys.env", ip: "10.0.2.15", status: "denied" },
  { timestamp: "2026-03-15 12:44:02", action: "UPLOAD_COMPLETE", user: "alex@company.com", target: "/Marketing/Campaign_Assets/hero_v2.psd", ip: "10.0.1.22", status: "success" },
  { timestamp: "2026-03-15 11:30:55", action: "LOGIN_SUCCESS", user: "sarah@company.com", target: "Session started", ip: "10.0.1.42", status: "success" },
  { timestamp: "2026-03-15 11:28:03", action: "LOGIN_FAILED", user: "unknown@external.com", target: "Invalid credentials (attempt 3)", ip: "203.0.113.42", status: "denied" },
  { timestamp: "2026-03-15 10:15:22", action: "BACKUP_COMPLETE", user: "system", target: "Daily backup: 2.4 TB verified", ip: "127.0.0.1", status: "success" },
  { timestamp: "2026-03-15 09:00:00", action: "CHECKSUM_WARN", user: "system", target: "/Research/datasets/training_set_v3.parquet mismatch", ip: "127.0.0.1", status: "warning" },
];

const statusColors: Record<string, string> = {
  success: "text-status-success",
  denied: "text-destructive",
  warning: "text-status-warning",
};

export default function ActivityLog() {
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
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Target</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">IP Address</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-surface transition-colors duration-150">
                <td className="px-4 py-2 text-xs font-mono-data text-muted-foreground whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="px-4 py-2">
                  <span className={`text-[10px] font-mono-data font-medium ${statusColors[log.status]}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm font-mono-data text-foreground">{log.user}</td>
                <td className="px-4 py-2 text-sm font-mono-data text-muted-foreground truncate max-w-xs">{log.target}</td>
                <td className="px-4 py-2 text-xs font-mono-data text-muted-foreground">{log.ip}</td>
                <td className="px-4 py-2">
                  <span className={`text-[10px] font-medium uppercase ${statusColors[log.status]}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Showing 10 of 48,291 entries</span>
          <div className="flex items-center gap-2">
            <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">Previous</button>
            <span className="text-xs font-mono-data text-muted-foreground">Page 1</span>
            <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
