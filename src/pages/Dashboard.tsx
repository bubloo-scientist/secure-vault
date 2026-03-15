import {
  HardDrive,
  Upload,
  Download,
  Users,
  ArrowUpRight,
  FileText,
  Folder,
  Clock,
} from "lucide-react";

const stats = [
  { label: "Total Storage", value: "0 B", sub: "of 10 TB", icon: HardDrive, trend: "No data yet" },
  { label: "Files Indexed", value: "0", sub: "objects", icon: FileText, trend: "Ready to ingest" },
  { label: "Active Users", value: "1", sub: "admin", icon: Users, trend: "You" },
  { label: "Uploads Today", value: "0", sub: "transfers", icon: Upload, trend: "Awaiting uploads" },
];

const recentActivity: { action: string; user: string; target: string; size: string; time: string }[] = [];

const actionColors: Record<string, string> = {
  UPLOAD: "text-status-success",
  DOWNLOAD: "text-status-info",
  DELETE: "text-destructive",
  PERM_CHANGE: "text-status-warning",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">System overview and recent activity.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight font-mono-data">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.sub}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg shadow-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          <a href="/activity" className="text-xs font-medium text-accent flex items-center gap-1 hover:underline">
            View all <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Clock className="w-5 h-5 mx-auto text-muted-foreground/40 mb-2" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">No activity yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Actions will appear here as your team uses the system.</p>
            </div>
          ) : (
            recentActivity.map((entry, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-2.5 hover:bg-surface transition-colors duration-150">
                <span className={`text-[10px] font-mono-data font-medium w-24 ${actionColors[entry.action] || "text-muted-foreground"}`}>
                  {entry.action}
                </span>
                <span className="text-sm text-foreground w-28 truncate">{entry.user}</span>
                <span className="text-sm text-muted-foreground font-mono-data flex-1 truncate">{entry.target}</span>
                <span className="text-xs text-muted-foreground font-mono-data w-20 text-right">{entry.size}</span>
                <span className="text-xs text-muted-foreground w-20 text-right flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  {entry.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
