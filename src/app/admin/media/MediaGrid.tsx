"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, FolderOpen, Trash2, Upload } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaFile } from "@/lib/admin/repositories/media.repository";

type MediaGridProps = {
  files: MediaFile[];
};

export function MediaGrid({ files }: MediaGridProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleCopyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(file.publicUrl);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.originalFilename}"? This cannot be undone if the image is not used elsewhere.`)) return;
    await fetch(`/api/admin/media/${file.id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    router.refresh();
  };

  return (
    <div>
      {/* Upload button */}
      <div className="mb-6">
        {showUpload ? (
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <p className="mb-2 text-sm font-medium text-[#0f172a]">Upload a new file:</p>
            <MediaPicker value={null} onChange={handleUploadComplete} placeholder="Drag & drop or click to upload" />
            <button type="button" onClick={() => setShowUpload(false)} className="mt-2 text-xs text-[#94a3b8] hover:text-red-500">Cancel</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2b5cff] px-4 py-2 text-sm font-medium text-white hover:bg-[#224ed8]"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative overflow-hidden rounded-lg border border-[#e2e8f0] bg-white transition-shadow hover:shadow-md"
          >
            {file.mimeType.startsWith("image/") ? (
              <div className="aspect-square overflow-hidden bg-[#f8fafc]">
                <img
                  src={file.publicUrl}
                  alt={file.altText ?? file.originalFilename}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center bg-[#f8fafc]">
                <FolderOpen className="h-8 w-8 text-[#94a3b8]" />
              </div>
            )}

            {/* Info */}
            <div className="p-2.5">
              <p className="truncate text-xs font-medium text-[#0f172a]" title={file.originalFilename}>
                {file.title ?? file.originalFilename}
              </p>
              <p className="mt-0.5 text-[10px] text-[#94a3b8]">
                {file.extension.toUpperCase()} · {formatSize(file.sizeBytes)}
                {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
              </p>
            </div>

            {/* Action buttons - appear on hover */}
            <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => handleCopyUrl(file)}
                className="rounded bg-white/90 p-1.5 text-[#64748b] shadow-sm backdrop-blur-sm hover:text-[#2b5cff]"
                title="Copy image URL"
              >
                {copiedId === file.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(file)}
                className="rounded bg-white/90 p-1.5 text-[#64748b] shadow-sm backdrop-blur-sm hover:text-red-600"
                title="Delete file"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
