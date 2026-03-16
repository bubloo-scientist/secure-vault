import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  FolderOpen,
  Folder,
  FileText,
  Download,
  Trash2,
  Upload,
  ChevronRight,
  ArrowUpDown,
  FolderPlus,
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
import { logActivity } from "@/lib/logActivity";
import {
  buildFileStoragePath,
  buildFolderPlaceholderPath,
  formatSize,
  mapVaultItem,
  VAULT_FOLDER_MIME,
  type VaultItem,
  type VaultRecord,
} from "@/lib/vault";
import { CreateFolderDialog } from "@/components/files/CreateFolderDialog";

function sortItems(items: VaultItem[]) {
  return [...items].sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export default function Files() {
  const [files, setFiles] = useState<VaultItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    try {
      const [{ data: fileData, error: fileError }, { data: profiles, error: profileError }] = await Promise.all([
        supabase.from("files_metadata").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
      ]);

      if (fileError) throw fileError;
      if (profileError) throw profileError;

      const profileMap = new Map(
        (profiles || []).map((profile) => [profile.id, profile.full_name || profile.email || "Unknown"])
      );

      setFiles(
        (fileData || []).map((record) =>
          mapVaultItem(record as VaultRecord, profileMap.get(record.uploaded_by ?? "") || "Unknown")
        )
      );
    } catch (err) {
      console.error("Error fetching files:", err);
      toast({
        title: "Could not load vault items",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    const channel = supabase
      .channel("vault-files-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "files_metadata" },
        () => void fetchFiles()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchFiles]);

  const visibleItems = useMemo(
    () => sortItems(files.filter((file) => file.parentPath === currentPath)),
    [files, currentPath]
  );

  const breadcrumbs = useMemo(
    () => (currentPath ? currentPath.split("/").filter(Boolean) : []),
    [currentPath]
  );

  const deleteTarget = files.find((file) => file.id === deleteConfirm) || null;

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || !user) return;
      setUploading(true);

      try {
        await Promise.all(
          Array.from(fileList).map(async (file) => {
            const storagePath = buildFileStoragePath(user.id, currentPath, file.name);

            const { error: uploadError } = await supabase.storage
              .from("vault-files")
              .upload(storagePath, file, { upsert: false });

            if (uploadError) throw uploadError;

            const { error: metaError } = await supabase.from("files_metadata").insert({
              name: file.name,
              storage_path: storagePath,
              size_bytes: file.size,
              mime_type: file.type || "application/octet-stream",
              uploaded_by: user.id,
            });

            if (metaError) {
              await supabase.storage.from("vault-files").remove([storagePath]);
              throw metaError;
            }

            await logActivity(
              "FILE_UPLOAD",
              `Uploaded: ${currentPath ? `${currentPath}/` : ""}${file.name} (${formatSize(file.size)})`
            );
          })
        );

        toast({
          title: "Upload complete",
          description: `${fileList.length} item${fileList.length !== 1 ? "s" : ""} saved to the vault.`,
        });
        await fetchFiles();
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
    [currentPath, fetchFiles, toast, user]
  );

  const handleCreateFolder = useCallback(
    async (folderName: string) => {
      if (!user) return;

      const normalizedName = folderName.trim().replace(/^\/+|\/+$/g, "");

      if (!normalizedName) return;
      if (normalizedName.includes("/")) {
        toast({
          title: "Invalid folder name",
          description: "Folder names cannot include slashes.",
          variant: "destructive",
        });
        return;
      }

      const duplicate = files.some(
        (file) => file.parentPath === currentPath && file.name.toLowerCase() === normalizedName.toLowerCase()
      );

      if (duplicate) {
        toast({
          title: "Folder already exists",
          description: `A file or folder named “${normalizedName}” already exists here.`,
          variant: "destructive",
        });
        return;
      }

      setCreatingFolder(true);

      try {
        const storagePath = buildFolderPlaceholderPath(user.id, currentPath, normalizedName);
        const { error: uploadError } = await supabase.storage
          .from("vault-files")
          .upload(storagePath, new Blob([""], { type: "text/plain" }), {
            contentType: "text/plain",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { error: metaError } = await supabase.from("files_metadata").insert({
          name: normalizedName,
          storage_path: storagePath,
          size_bytes: 0,
          mime_type: VAULT_FOLDER_MIME,
          uploaded_by: user.id,
        });

        if (metaError) {
          await supabase.storage.from("vault-files").remove([storagePath]);
          throw metaError;
        }

        await logActivity(
          "FOLDER_CREATE",
          `Created folder: ${currentPath ? `${currentPath}/` : ""}${normalizedName}`
        );

        toast({ title: "Folder created", description: `${normalizedName} was saved in the vault.` });
        setCreateFolderOpen(false);
        await fetchFiles();
      } catch (err: any) {
        toast({
          title: "Folder creation failed",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setCreatingFolder(false);
      }
    },
    [currentPath, files, fetchFiles, toast, user]
  );

  const handleDownload = async (file: VaultItem) => {
    if (file.isFolder) {
      setCurrentPath(file.fullPath);
      return;
    }

    try {
      const { data, error } = await supabase.storage.from("vault-files").download(file.storagePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      await logActivity("FILE_DOWNLOAD", `Downloaded: ${file.fullPath}`);
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    }
  };

  const handleRemove = async (id: string) => {
    const target = files.find((file) => file.id === id);
    if (!target) return;

    try {
      const descendants = target.isFolder
        ? files.filter((file) => file.id === target.id || file.fullPath.startsWith(`${target.fullPath}/`))
        : [target];

      const storagePaths = descendants.map((file) => file.storagePath);
      const metadataIds = descendants.map((file) => file.id);

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage.from("vault-files").remove(storagePaths);
        if (storageError) throw storageError;
      }

      const { error: metaError } = await supabase.from("files_metadata").delete().in("id", metadataIds);
      if (metaError) throw metaError;

      await logActivity(
        target.isFolder ? "FOLDER_DELETE" : "FILE_DELETE",
        target.isFolder ? `Deleted folder: ${target.fullPath}` : `Deleted: ${target.fullPath}`
      );

      if (currentPath === target.fullPath || currentPath.startsWith(`${target.fullPath}/`)) {
        setCurrentPath(target.parentPath);
      }

      await fetchFiles();
      setDeleteConfirm(null);
      toast({ title: target.isFolder ? "Folder deleted" : "File deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const visibleTotalSize = visibleItems.reduce(
    (sum, file) => sum + (file.isFolder ? 0 : file.sizeBytes),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">File Browser</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <button onClick={() => setCurrentPath("")} className="hover:text-foreground">
              Root
            </button>
            {breadcrumbs.map((crumb, index) => {
              const path = breadcrumbs.slice(0, index + 1).join("/");
              const isLast = index === breadcrumbs.length - 1;

              return (
                <div key={path} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  <button
                    onClick={() => setCurrentPath(path)}
                    className={isLast ? "font-medium text-foreground" : "hover:text-foreground"}
                  >
                    {crumb}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateFolderOpen(true)}
            disabled={creatingFolder || uploading}
            className="flex items-center gap-2 h-8 px-4 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 disabled:opacity-50"
          >
            <FolderPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
            New Folder
          </button>
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
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-150 ${
          dragOver ? "border-accent bg-accent/5" : "border-border"
        }`}
      >
        <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">
          Drag videos, pictures, or text files here to save them {currentPath ? `in ${currentPath}` : "to the vault"}, or{" "}
          <button onClick={() => inputRef.current?.click()} className="text-accent hover:underline font-medium">
            browse
          </button>
        </p>
        <p className="text-xs text-muted-foreground mt-1">Folders are created manually and saved as part of the vault structure.</p>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                <span className="flex items-center gap-1 cursor-default">
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
                  <p className="text-sm text-muted-foreground">Loading vault…</p>
                </td>
              </tr>
            ) : visibleItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <FolderOpen className="w-6 h-6 mx-auto text-muted-foreground/40 mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">
                    {currentPath ? "This folder is empty." : "No files or folders yet."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentPath
                      ? "Upload files here or create another folder."
                      : "Upload files using the drop zone above or create your first folder."}
                  </p>
                </td>
              </tr>
            ) : (
              visibleItems.map((file) => (
                <tr
                  key={file.id}
                  className="border-b border-border last:border-0 hover:bg-surface group transition-colors duration-150"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      {file.isFolder ? (
                        <Folder className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      )}
                      {file.isFolder ? (
                        <button
                          onClick={() => setCurrentPath(file.fullPath)}
                          className="text-sm text-foreground hover:text-accent transition-colors duration-150"
                        >
                          {file.name}
                        </button>
                      ) : (
                        <span className="text-sm text-foreground">{file.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-mono-data text-muted-foreground">{file.size}</td>
                  <td className="px-4 py-2.5 text-sm font-mono-data text-muted-foreground">{file.modified}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{file.owner}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-150 justify-end">
                      {!file.isFolder && (
                        <button
                          onClick={() => void handleDownload(file)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface"
                        >
                          <Download className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      )}
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
            {visibleItems.length} item{visibleItems.length !== 1 ? "s" : ""} · {formatSize(visibleTotalSize)} visible
          </span>
          <span className="text-xs text-muted-foreground font-mono-data">10 TB available</span>
        </div>
      </div>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm shadow-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Delete {deleteTarget?.isFolder ? "Folder" : "File"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground font-mono-data">{deleteTarget?.name}</span>?
            {deleteTarget?.isFolder
              ? " Everything inside this folder will be removed too."
              : " This action cannot be undone."}
          </p>
          <DialogFooter>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="h-8 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground border border-border transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && void handleRemove(deleteConfirm)}
              className="h-8 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateFolderDialog
        open={createFolderOpen}
        creating={creatingFolder}
        onOpenChange={setCreateFolderOpen}
        onCreate={handleCreateFolder}
      />
    </div>
  );
}
