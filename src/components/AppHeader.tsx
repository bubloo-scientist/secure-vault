import { Search, Bell, User } from "lucide-react";
import { useState } from "react";
import { CommandPalette } from "./CommandPalette";

export function AppHeader() {
  const [commandOpen, setCommandOpen] = useState(false);

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
          <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors duration-150 relative">
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
          </button>
          <button className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <User className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
