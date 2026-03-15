import { useState } from "react";
import {
  Users,
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MoreHorizontal,
  Mail,
  Clock,
  Check,
  X,
} from "lucide-react";

interface TeamMember {
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "invited" | "disabled";
  lastActive: string;
  permissions: { upload: boolean; download: boolean; delete: boolean; manage: boolean };
}

const mockUsers: TeamMember[] = [
  { name: "You (Admin)", email: "admin@company.com", role: "admin", status: "active", lastActive: "Now", permissions: { upload: true, download: true, delete: true, manage: true } },
  { name: "Sarah Chen", email: "sarah@company.com", role: "editor", status: "active", lastActive: "2 min ago", permissions: { upload: true, download: true, delete: false, manage: false } },
  { name: "Marcus Lee", email: "marcus@company.com", role: "editor", status: "active", lastActive: "8 min ago", permissions: { upload: true, download: true, delete: false, manage: false } },
  { name: "Alex Rivera", email: "alex@company.com", role: "editor", status: "active", lastActive: "1h ago", permissions: { upload: true, download: true, delete: false, manage: false } },
  { name: "Taylor Kim", email: "taylor@company.com", role: "viewer", status: "active", lastActive: "3h ago", permissions: { upload: false, download: true, delete: false, manage: false } },
  { name: "James Park", email: "james@company.com", role: "viewer", status: "invited", lastActive: "—", permissions: { upload: false, download: true, delete: false, manage: false } },
];

const roleBadge: Record<string, string> = {
  admin: "bg-primary text-primary-foreground",
  editor: "bg-accent text-accent-foreground",
  viewer: "bg-surface text-foreground",
};

const statusDot: Record<string, string> = {
  active: "bg-status-success",
  invited: "bg-status-warning",
  disabled: "bg-destructive",
};

export default function UsersManagement() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage team access and permissions.</p>
        </div>
        <button className="flex items-center gap-2 h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150">
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          Invite Member
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">User</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Role</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Status</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2.5">Upload</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2.5">Download</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2.5">Delete</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2.5">Manage</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Last Active</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.email} className="border-b border-border last:border-0 hover:bg-surface group transition-colors duration-150">
                <td className="px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-mono-data">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${roleBadge[user.role]}`}>
                    {user.role === "admin" && <ShieldAlert className="w-3 h-3" strokeWidth={1.5} />}
                    {user.role === "editor" && <ShieldCheck className="w-3 h-3" strokeWidth={1.5} />}
                    {user.role === "viewer" && <Shield className="w-3 h-3" strokeWidth={1.5} />}
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[user.status]}`} />
                    <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
                  </span>
                </td>
                {(["upload", "download", "delete", "manage"] as const).map((perm) => (
                  <td key={perm} className="px-4 py-2.5 text-center">
                    {user.permissions[perm] ? (
                      <Check className="w-4 h-4 text-status-success mx-auto" strokeWidth={1.5} />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/30 mx-auto" strokeWidth={1.5} />
                    )}
                  </td>
                ))}
                <td className="px-4 py-2.5">
                  <span className="text-xs text-muted-foreground font-mono-data flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {user.lastActive}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background transition-all duration-150">
                    <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2.5 border-t border-border">
          <span className="text-xs text-muted-foreground">6 members · 1 pending invitation</span>
        </div>
      </div>
    </div>
  );
}
