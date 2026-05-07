import { NextRequest, NextResponse } from "next/server";

const PLACEHOLDER_VALUES = new Set([
  "your-cloud-name",
  "your-api-key",
  "your-api-secret",
  "",
]);

function isConfigured(value: string | undefined): value is string {
  return !!value && !PLACEHOLDER_VALUES.has(value);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ urls: [] });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    // Use dev fallback when Cloudinary is not configured or has placeholder values
    if (!isConfigured(cloudName) || !isConfigured(uploadPreset)) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "File storage is not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in your environment variables." },
          { status: 503 }
        );
      }
      // Development fallback — placeholder images so the form still works
      const urls = files.map((_, i) => `https://placehold.co/600x600/1a1a1a/ffffff?text=Image+${i + 1}`);
      return NextResponse.json({ urls });
    }

    const uploadPromises = files.map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset);
      fd.append("folder", "tatbook/flash");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: fd }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error?.message ?? "Upload failed";
        throw new Error(`Cloudinary error: ${msg}`);
      }

      const data = await res.json();
      return data.secure_url as string;
    });

    const urls = await Promise.all(uploadPromises);
    return NextResponse.json({ urls });
  } catch (err) {
    console.error("Upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
