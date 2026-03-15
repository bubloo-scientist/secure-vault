import { useState, useRef, useCallback, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  Download,
  Trash2,
  Upload,
  ChevronRight,
  ArrowUpDown,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FileItem {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  modified: string;
  owner: string;
  storagePath: string;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export default function Files() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("files_metadata")
        .select("*, profiles:uploaded_by(full_name, email)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFiles(
        (data || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          size: formatSize(f.size_bytes),
          sizeBytes: f.size_bytes,
          modified: new Date(f.created_at).toLocaleDateString(),
          owner: f.profiles?.full_name || f.profiles?.email || "Unknown",
          storagePath: f.storage_path,
        }))
      );
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || !user) return;
      setUploading(true);

      try {
        for (const file of Array.from(fileList)) {
          const storagePath = `${user.id}/${Date.now()}-${file.name}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from("vault-files")
            .upload(storagePath, file);

          if (uploadError) throw uploadError;

          // Save metadata
          const { error: metaError } = await supabase
            .from("files_metadata")
            .insert({
              name: file.name,
              storage_path: storagePath,
              size_bytes: file.size,
              mime_type: file.type || null,
              uploaded_by: user.id,
            });

          if (metaError) throw metaError;
        }

        toast({ title: "Upload complete", description: `${fileList.length} file(s) uploaded.` });
        fetchFiles();
      } catch (err: any) {
        toast({
          title: "Upload failed",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [user, fetchFiles, toast]
  );

  const handleDownload = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from("vault-files")
        .download(file.storagePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    }
  };

  const handleRemove = async (id: string) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;

    try {
      await supabase.storage.from("vault-files").remove([file.storagePath]);
      await supabase.from("files_metadata").delete().eq("id", id);
      fetchFiles();
      setDeleteConfirm(null);
      toast({ title: "File deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">File Browser</h1>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <span className="hover:text-foreground cursor-pointer">Root</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">All Files</span>
          </div>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-150 ${
          dragOver ? "border-accent bg-accent/5" : "border-border"
        }`}
      >
        <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">
          Drag files here to upload, or{" "}
          <button onClick={() => inputRef.current?.click()} className="text-accent hover:underline font-medium">
            browse
          </button>
        </p>
        <p className="text-xs text-muted-foreground mt-1">Supports any file type</p>
      </div>

      {/* File Table */}
      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                <span className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  Name <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Size</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Modified</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Owner</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <p className="text-sm text-muted-foreground">Loading files…</p>
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <FolderOpen className="w-6 h-6 mx-auto text-muted-foreground/40 mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">No files yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload files using the drop zone above or the Upload button.</p>
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="border-b border-border last:border-0 hover:bg-surface group transition-colors duration-150">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-sm text-foreground">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-mono-data text-muted-foreground">{file.size}</td>
                  <td className="px-4 py-2.5 text-sm font-mono-data text-muted-foreground">{file.modified}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{file.owner}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                      <button
                        onClick={() => handleDownload(file)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface"
                      >
                        <Download className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(file.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {files.length} item{files.length !== 1 ? "s" : ""} · {formatSize(totalSize)} used
          </span>
          <span className="text-xs text-muted-foreground font-mono-data">10 TB available</span>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm shadow-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">Delete File</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground font-mono-data">
              {files.find((f) => f.id === deleteConfirm)?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <button onClick={() => setDeleteConfirm(null)} className="h-8 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground border border-border transition-colors duration-150">
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && handleRemove(deleteConfirm)}
              className="h-8 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
