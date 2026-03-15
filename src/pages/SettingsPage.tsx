import { Shield, HardDrive, Bell, Key, Clock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">System configuration and security settings.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-lg shadow-card p-4 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <Shield className="w-4 h-4 text-foreground" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-foreground">Security</h2>
          </div>
          <SettingRow label="Enforce 2FA" description="Require two-factor authentication for all users." enabled={true} />
          <SettingRow label="Session Timeout" description="Auto-logout after 30 minutes of inactivity." enabled={true} />
          <SettingRow label="IP Allowlist" description="Restrict access to approved IP addresses only." enabled={false} />
        </div>

        <div className="bg-card rounded-lg shadow-card p-4 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <HardDrive className="w-4 h-4 text-foreground" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-foreground">Storage</h2>
          </div>
          <SettingRow label="Auto-Backup" description="Daily incremental backup at 02:00 UTC." enabled={true} />
          <SettingRow label="Versioning" description="Keep previous versions of overwritten files." enabled={true} />
          <SettingRow label="Checksum Validation" description="Verify SHA-256 checksum on every upload." enabled={true} />
        </div>

        <div className="bg-card rounded-lg shadow-card p-4 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <Bell className="w-4 h-4 text-foreground" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
          </div>
          <SettingRow label="Upload Alerts" description="Notify admin on uploads exceeding 10 GB." enabled={true} />
          <SettingRow label="Security Alerts" description="Alert on failed login attempts and permission denials." enabled={true} />
          <SettingRow label="Storage Threshold" description="Alert when storage exceeds 80% capacity." enabled={false} />
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, description, enabled }: { label: string; description: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button className={`w-9 h-5 rounded-full relative transition-colors duration-150 ${enabled ? "bg-accent" : "bg-border"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-150 ${enabled ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
