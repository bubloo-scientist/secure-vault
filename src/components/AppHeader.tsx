import { Search, Bell, User, LogOut } from "lucide-react";
import { useState } from "react";
import { CommandPalette } from "./CommandPalette";
import { useAuth } from "@/contexts/AuthContext";

export function AppHeader() {
  const [commandOpen, setCommandOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-20 h-14 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-surface text-muted-foreground text-sm hover:border-foreground/20 transition-colors duration-150 w-64"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="flex-1 text-left">Search files…</span>
            <kbd className="text-[10px] font-mono-data bg-background px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono-data mr-2">
            {user?.email}
          </span>
          <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors duration-150 relative">
            <Bell className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={signOut}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
