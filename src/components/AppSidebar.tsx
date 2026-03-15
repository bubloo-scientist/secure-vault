import { Link, useLocation } from "react-router-dom";
import {
  Database,
  FolderOpen,
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  Shield,
  HardDrive,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FolderOpen, label: "Files", path: "/files" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: Activity, label: "Activity Log", path: "/activity" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-surface border-r border-border flex flex-col z-30">
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <Database className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">Vault</p>
          <p className="text-[10px] text-muted-foreground font-medium">Data Management</p>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Storage Used</span>
            <span className="text-xs font-mono-data text-muted-foreground">2.4 / 10 TB</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: "24%" }} />
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 mt-1">
          <Shield className="w-3.5 h-3.5 text-status-success" strokeWidth={1.5} />
          <span className="text-xs text-muted-foreground">Encrypted · Secure</span>
        </div>
      </div>
    </aside>
  );
}
