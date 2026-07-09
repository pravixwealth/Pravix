import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createMedia } from "@/lib/admin/repositories/media.repository";
import { resolveAdminUser } from "@/lib/admin/repositories/auth.repository";
import { hasRole } from "@/lib/admin/types";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const prefix = "sb-";
  const suffix = "auth-token";

  const authCookies = all
    .filter((c) => c.name.startsWith(prefix) && c.name.includes(suffix))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (authCookies.length === 0) return null;

  const combined = authCookies.map((c) => c.value).join("");

  try {
    let decoded = combined;
    if (decoded.includes("%7B") || decoded.includes("%22")) {
      decoded = decodeURIComponent(decoded);
    }
    if (decoded.includes("%7B") || decoded.includes("%22")) {
      decoded = decodeURIComponent(decoded);
    }
    const parsed = JSON.parse(decoded);
    return parsed?.access_token ?? null;
  } catch {
    return combined.length > 20 ? combined : null;
  }
}

export async function POST(request: Request) {
  try {
    // Read auth from cookie (admin session)
    const accessToken = await getAccessTokenFromCookies();
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!anonKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // Verify user from token
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Verify admin role
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const adminResult = await resolveAdminUser(adminClient, userId);
    if (!adminResult.success || !hasRole(adminResult.data.roles, "editor")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).slice(2, 8);
    const filename = `${timestamp}-${randomId}.${ext}`;
    const storagePath = `uploads/${filename}`;

    // Upload to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminClient.storage
      .from("media")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, try creating it
      if (uploadError.message.includes("not found") || uploadError.message.includes("Bucket")) {
        await adminClient.storage.createBucket("media", { public: true });
        const { error: retryError } = await adminClient.storage
          .from("media")
          .upload(storagePath, fileBuffer, {
            contentType: file.type,
            upsert: false,
          });
        if (retryError) {
          return NextResponse.json({ error: `Upload failed: ${retryError.message}` }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
      }
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from("media")
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Create media record in database
    const mediaResult = await createMedia(adminClient, {
      filename,
      originalFilename: file.name,
      storagePath,
      publicUrl,
      mimeType: file.type,
      extension: ext,
      sizeBytes: file.size,
      uploadedBy: userId,
    });

    if (!mediaResult.success) {
      return NextResponse.json({ error: mediaResult.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, media: mediaResult.data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
