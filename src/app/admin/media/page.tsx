import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { listMedia } from "@/lib/admin/repositories/media.repository";
import { FolderOpen } from "lucide-react";
import { MediaGrid } from "./MediaGrid";

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
            description="Upload images through the blog editor or use the Upload button above."
          />
        ) : (
          <MediaGrid files={files} />
        )}
      </div>
    </div>
  );
}
