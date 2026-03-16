export const VAULT_FOLDER_MIME = "application/x-vault-folder";

export interface VaultRecord {
  id: string;
  name: string;
  size_bytes: number;
  created_at: string;
  uploaded_by: string | null;
  storage_path: string;
  mime_type: string | null;
}

export interface VaultItem {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  modified: string;
  owner: string;
  storagePath: string;
  mimeType: string | null;
  isFolder: boolean;
  parentPath: string;
  fullPath: string;
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function isFolderMime(mimeType: string | null | undefined) {
  return mimeType === VAULT_FOLDER_MIME;
}

export function buildFileStoragePath(userId: string, currentPath: string, fileName: string) {
  const folderPrefix = currentPath ? `${currentPath}/` : "";
  return `${userId}/${folderPrefix}${Date.now()}-${fileName}`;
}

export function buildFolderPlaceholderPath(userId: string, currentPath: string, folderName: string) {
  const folderPrefix = currentPath ? `${currentPath}/` : "";
  return `${userId}/${folderPrefix}${folderName}/.keep`;
}

function getRelativeStoragePath(storagePath: string) {
  return storagePath.split("/").slice(1).join("/");
}

export function getParentPath(storagePath: string, mimeType: string | null) {
  const parts = getRelativeStoragePath(storagePath).split("/").filter(Boolean);
  if (parts.length === 0) return "";
  return isFolderMime(mimeType) ? parts.slice(0, -2).join("/") : parts.slice(0, -1).join("/");
}

export function getFullPath(name: string, storagePath: string, mimeType: string | null) {
  const parentPath = getParentPath(storagePath, mimeType);
  return parentPath ? `${parentPath}/${name}` : name;
}

export function mapVaultItem(record: VaultRecord, owner: string) {
  return {
    id: record.id,
    name: record.name,
    size: isFolderMime(record.mime_type) ? "Folder" : formatSize(record.size_bytes),
    sizeBytes: record.size_bytes,
    modified: new Date(record.created_at).toLocaleDateString(),
    owner,
    storagePath: record.storage_path,
    mimeType: record.mime_type,
    isFolder: isFolderMime(record.mime_type),
    parentPath: getParentPath(record.storage_path, record.mime_type),
    fullPath: getFullPath(record.name, record.storage_path, record.mime_type),
  } satisfies VaultItem;
}
