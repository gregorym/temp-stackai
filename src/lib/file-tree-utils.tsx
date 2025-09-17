import {
  ChevronDown,
  ChevronRight,
  DatabaseBackup,
  DatabaseZap,
  File,
  FileSpreadsheet,
  FileText,
  FileWarning,
  Folder,
  FolderOpen,
  Hourglass,
  Image,
} from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "indexed":
      return <DatabaseZap className="h-4 w-4 text-blue-600" />;
    case "parsed":
      return <DatabaseBackup className="h-4 w-4" />;
    case "pending":
      return <Hourglass className="h-4 w-4 text-green-600" />;
    case "error":
      return <FileWarning className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

export const getFileIcon = (node: any, isExpanded?: boolean) => {
  const type = node.type || node.inode_type;
  if (type === "directory") {
    return isExpanded ? (
      <FolderOpen className="h-4 w-4 text-blue-600" />
    ) : (
      <Folder className="h-4 w-4 text-blue-600" />
    );
  }

  // File type icons based on MIME type
  const mimeType = node.mimeType?.toLowerCase();
  if (mimeType?.includes("image/")) {
    return <Image className="h-4 w-4 text-gray-600" />;
  }
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("csv")) {
    return <FileSpreadsheet className="h-4 w-4 text-gray-600" />;
  }
  if (mimeType?.includes("text/") || mimeType?.includes("pdf")) {
    return <FileText className="h-4 w-4 text-gray-600" />;
  }

  return <File className="h-4 w-4 text-gray-600" />;
};

export const getExpandIcon = (isExpanded: boolean, isLoading?: boolean) => {
  if (isLoading) {
    return (
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
    );
  }

  return isExpanded ? (
    <ChevronDown className="h-4 w-4 text-gray-600" />
  ) : (
    <ChevronRight className="h-4 w-4 text-gray-600" />
  );
};

export const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};
