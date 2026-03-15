import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { FileText, Folder, Users, Settings } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg overflow-hidden border border-border shadow-card">
        <Command className="rounded-lg">
          <CommandInput placeholder="Search files, users, settings…" className="h-12 text-sm" />
          <CommandList className="max-h-80">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </CommandEmpty>
            <CommandGroup heading="Recent Files">
              <CommandItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <p className="text-sm">Q3_Financial_Report.xlsx</p>
                  <p className="text-xs text-muted-foreground font-mono-data">2.4 MB · Modified 2h ago</p>
                </div>
              </CommandItem>
              <CommandItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Folder className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <p className="text-sm">Engineering/Backups</p>
                  <p className="text-xs text-muted-foreground font-mono-data">148 objects · 1.2 TB</p>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Quick Actions">
              <CommandItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Users className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm">Manage Users</span>
              </CommandItem>
              <CommandItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Settings className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm">System Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
