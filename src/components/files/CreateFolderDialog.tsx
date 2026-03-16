import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CreateFolderDialogProps {
  open: boolean;
  creating: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => Promise<void>;
}

export function CreateFolderDialog({
  open,
  creating,
  onOpenChange,
  onCreate,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    await onCreate(trimmedName);
    setName("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setName("");
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm shadow-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">Create Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Create a manual folder to organize uploaded videos, images, and documents.</p>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleCreate();
              }
            }}
            placeholder="Folder name"
            maxLength={80}
          />
        </div>
        <DialogFooter>
          <button
            onClick={() => handleOpenChange(false)}
            className="h-8 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground border border-border transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleCreate()}
            disabled={creating || !name.trim()}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
