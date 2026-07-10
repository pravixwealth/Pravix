import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { listMedia } from "@/lib/admin/repositories/media.repository";
import { FolderOpen } from "lucide-react";

export default async function MediaLibraryPage() {
  await requireRole("editor");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const result = await listMedia(supabase, { perPage: 50 });
  const files = result.success ? result.data.files : [];
  const total = result.success ? result.data.total : 0;

  return (
    <div>
      <PageHeader
        title="Media Library"
        description={`${total} file${total !== 1 ? "s" : ""} uploaded`}
      />

      <div className="mt-8">
        {files.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-6 w-6" />}
            title="No media files yet"
            description="Upload images through the blog editor's Featured Image picker, or drag files here."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {files.map((file) => (
              <div
                key={file.id}
                className="group overflow-hidden rounded-lg border border-[#e2e8f0] bg-white transition-shadow hover:shadow-md"
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
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-[#0f172a]">
                    {file.title ?? file.originalFilename}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#94a3b8]">
                    {file.extension.toUpperCase()} · {formatSize(file.sizeBytes)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
