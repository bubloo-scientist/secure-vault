import { useState } from "react";
import {
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MoreHorizontal,
  Clock,
  Check,
  X,
  Trash2,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "admin" | "editor" | "viewer";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited" | "disabled";
  lastActive: string;
  permissions: { upload: boolean; download: boolean; delete: boolean; manage: boolean };
}

const defaultPerms: Record<Role, TeamMember["permissions"]> = {
  admin: { upload: true, download: true, delete: true, manage: true },
  editor: { upload: true, download: true, delete: false, manage: false },
  viewer: { upload: false, download: true, delete: false, manage: false },
};

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
  const [users, setUsers] = useState<TeamMember[]>([
    {
      id: "admin-1",
      name: "You (Admin)",
      email: "admin@company.com",
      role: "admin",
      status: "active",
      lastActive: "Now",
      permissions: defaultPerms.admin,
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("viewer");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddUser = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const member: TeamMember = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: "invited",
      lastActive: "—",
      permissions: defaultPerms[newRole],
    };
    setUsers((prev) => [...prev, member]);
    setNewName("");
    setNewEmail("");
    setNewRole("viewer");
    setDialogOpen(false);
  };

  const handleRemoveUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteConfirm(null);
  };

  const togglePermission = (id: string, perm: keyof TeamMember["permissions"]) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id && u.id !== "admin-1"
          ? { ...u, permissions: { ...u.permissions, [perm]: !u.permissions[perm] } }
          : u
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage team access and permissions.</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          Add Member
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
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface group transition-colors duration-150">
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
                    <button
                      onClick={() => togglePermission(user.id, perm)}
                      disabled={user.id === "admin-1"}
                      className="mx-auto disabled:cursor-default"
                    >
                      {user.permissions[perm] ? (
                        <Check className="w-4 h-4 text-status-success mx-auto" strokeWidth={1.5} />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/30 mx-auto" strokeWidth={1.5} />
                      )}
                    </button>
                  </td>
                ))}
                <td className="px-4 py-2.5">
                  <span className="text-xs text-muted-foreground font-mono-data flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {user.lastActive}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {user.id !== "admin-1" && (
                    <button
                      onClick={() => setDeleteConfirm(user.id)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2.5 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {users.length} member{users.length !== 1 ? "s" : ""} · {users.filter((u) => u.status === "invited").length} pending
          </span>
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md shadow-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Email Address</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. sarah@company.com"
                className="h-9 text-sm font-mono-data"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Role</Label>
              <div className="flex gap-2">
                {(["viewer", "editor", "admin"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`flex-1 h-9 rounded-md text-sm font-medium border transition-all duration-150 ${
                      newRole === role
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {newRole === "viewer" && "Can view and download files."}
                {newRole === "editor" && "Can upload, view, and download files."}
                {newRole === "admin" && "Full access including user management and deletion."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="h-8 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground border border-border transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              disabled={!newName.trim() || !newEmail.trim()}
              className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Member
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm shadow-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">Remove Member</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground font-mono-data">
              {users.find((u) => u.id === deleteConfirm)?.email}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="h-8 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground border border-border transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && handleRemoveUser(deleteConfirm)}
              className="h-8 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              Remove
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
