import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

const PLACEHOLDER_VALUES = new Set(["your-cloud-name", "your-api-key", "your-api-secret", ""]);

function isConfigured(value: string | undefined): value is string {
  return !!value && !PLACEHOLDER_VALUES.has(value);
}

async function saveLocally(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const filename = `${randomBytes(16).toString("hex")}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
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

    if (!isConfigured(cloudName) || !isConfigured(uploadPreset)) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "File storage is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in your environment." },
          { status: 503 }
        );
      }
      // Dev: save files to public/uploads/ so they actually display
      const urls = await Promise.all(files.map(saveLocally));
      return NextResponse.json({ urls });
    }

    const urls = await Promise.all(
      files.map(async (file) => {
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
          throw new Error(`Cloudinary error: ${body?.error?.message ?? "upload failed"}`);
        }

        const data = await res.json();
        return data.secure_url as string;
      })
    );

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
