import { useState } from "react";
import {
  FileText,
  Folder,
  Download,
  Trash2,
  Upload,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
} from "lucide-react";

interface FileItem {
  name: string;
  type: "file" | "folder";
  size: string;
  modified: string;
  owner: string;
  objects?: number;
}

const mockFiles: FileItem[] = [
  { name: "Engineering", type: "folder", size: "1.2 TB", modified: "2026-03-15", owner: "System", objects: 284102 },
  { name: "Finance", type: "folder", size: "340 GB", modified: "2026-03-14", owner: "Sarah Chen", objects: 12840 },
  { name: "Marketing", type: "folder", size: "89 GB", modified: "2026-03-15", owner: "Alex Rivera", objects: 4201 },
  { name: "Research", type: "folder", size: "680 GB", modified: "2026-03-13", owner: "Taylor Kim", objects: 98450 },
  { name: "system_config.yaml", type: "file", size: "4.2 KB", modified: "2026-03-15", owner: "Admin" },
  { name: "backup_manifest.json", type: "file", size: "1.8 MB", modified: "2026-03-15", owner: "System" },
  { name: "access_policy.pdf", type: "file", size: "240 KB", modified: "2026-03-10", owner: "Admin" },
  { name: "migration_log_0315.txt", type: "file", size: "12 KB", modified: "2026-03-15", owner: "System" },
];

export default function Files() {
  const [dragOver, setDragOver] = useState(false);

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
        <button className="flex items-center gap-2 h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-150">
          <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
          Upload
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-150 ${
          dragOver ? "border-accent bg-accent/5" : "border-border"
        }`}
      >
        <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">
          Drag files or folders here to upload
        </p>
        <p className="text-xs text-muted-foreground mt-1">Max file size: 50 GB per object</p>
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
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {mockFiles.map((file) => (
              <tr
                key={file.name}
                className="border-b border-border last:border-0 hover:bg-surface group transition-colors duration-150 cursor-pointer"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    {file.type === "folder" ? (
                      <Folder className="w-4 h-4 text-accent" strokeWidth={1.5} />
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    )}
                    <span className="text-sm text-foreground group-hover:translate-x-1 transition-transform duration-150">
                      {file.name}
                    </span>
                    {file.objects !== undefined && (
                      <span className="text-[10px] font-mono-data text-muted-foreground">
                        {file.objects.toLocaleString()} objects
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-sm font-mono-data text-muted-foreground">{file.size}</td>
                <td className="px-4 py-2.5 text-sm font-mono-data text-muted-foreground">{file.modified}</td>
                <td className="px-4 py-2.5 text-sm text-muted-foreground">{file.owner}</td>
                <td className="px-4 py-2.5">
                  <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background transition-all duration-150">
                    <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">8 items · 2.31 TB total</span>
          <span className="text-xs text-muted-foreground font-mono-data">Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
