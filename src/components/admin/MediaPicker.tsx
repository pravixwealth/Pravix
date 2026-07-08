"use client";

import { useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import type { MediaFile } from "@/lib/admin/repositories/media.repository";

type MediaPickerProps = {
  value: MediaFile | null;
  onChange: (media: MediaFile | null) => void;
  accept?: string;
  placeholder?: string;
};

/**
 * Reusable Media Picker component.
 * Used by: Settings, Blog, Pages, Navigation, Testimonials, Email — everything.
 * No module implements its own image selector.
 *
 * Currently renders with a simple preview + upload placeholder.
 * Full modal browser (folder nav, search, grid) will be wired when
 * the Media Library page UI is complete.
 */
export function MediaPicker({
  value,
  onChange,
  accept = "image/*",
  placeholder = "Select an image",
}: MediaPickerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleRemove = () => {
    onChange(null);
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
    <div
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
        isDragging
          ? "border-[#2b5cff] bg-[#2b5cff]/5"
          : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#94a3b8]"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      role="button"
      tabIndex={0}
      aria-label={placeholder}
    >
      <Upload className="h-6 w-6 text-[#94a3b8]" />
      <p className="mt-2 text-sm text-[#64748b]">{placeholder}</p>
      <p className="mt-1 text-xs text-[#94a3b8]">
        Drag & drop or click to browse
      </p>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
