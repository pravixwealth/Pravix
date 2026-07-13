"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import type { MediaFile } from "@/lib/admin/repositories/media.repository";

type MediaPickerProps = {
  value: MediaFile | null;
  onChange: (media: MediaFile | null) => void;
  accept?: string;
  placeholder?: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

export function MediaPicker({
  value,
  onChange,
  accept = "image/*",
  placeholder = "Select an image",
}: MediaPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Unsupported file type. Use JPEG, PNG, WebP, GIF, SVG, or AVIF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);

    try {
      // Upload via API
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Upload failed");
        return;
      }

      const data = await response.json();

      if (data.media) {
        onChange(data.media as MediaFile);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (value) {
    return (
      <div className="group relative inline-flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-white p-2 pr-10">
        {value.mimeType.startsWith("image/") ? (
          <img
            src={value.publicUrl}
            alt={value.altText ?? value.originalFilename}
            className="h-12 w-12 rounded object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-[#f1f5f9]">
            <ImageIcon className="h-5 w-5 text-[#94a3b8]" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#0f172a]">
            {value.title ?? value.originalFilename}
          </p>
          <p className="text-xs text-[#64748b]">
            {value.width && value.height ? `${value.width}×${value.height} · ` : ""}
            {formatFileSize(value.sizeBytes)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="absolute right-2 top-2 rounded-full p-1 text-[#94a3b8] opacity-0 transition-opacity hover:bg-[#f1f5f9] hover:text-red-500 group-hover:opacity-100"
          aria-label="Remove selected image"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
          isDragging
            ? "border-[#2b5cff] bg-[#2b5cff]/5"
            : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#94a3b8]"
        }`}
        onClick={handleClick}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
        role="button"
        tabIndex={0}
        aria-label={placeholder}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-[#2b5cff]" />
            <p className="mt-2 text-sm text-[#2b5cff]">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-[#94a3b8]" />
            <p className="mt-2 text-sm text-[#64748b]">{placeholder}</p>
            <p className="mt-1 text-xs text-[#94a3b8]">
              Drag & drop or click to browse
            </p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
