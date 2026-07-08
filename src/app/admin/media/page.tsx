import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { FolderOpen } from "lucide-react";

export default async function MediaLibraryPage() {
  await requireRole("editor");

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Upload, organize, and manage images used across the website."
      />
      <div className="mt-8">
        <EmptyState
          icon={<FolderOpen className="h-6 w-6" />}
          title="Media Library ready"
          description="Upload images to use in blog posts, settings, and throughout the admin. Drag and drop or click to upload."
          action={
            <button
              type="button"
              className="rounded-lg bg-[#2b5cff] px-4 py-2 text-sm font-medium text-white hover:bg-[#224ed8]"
            >
              Upload Files
            </button>
          }
        />
      </div>
    </div>
  );
}
