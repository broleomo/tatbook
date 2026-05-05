import { NextRequest, NextResponse } from "next/server";

/**
 * Reference image upload endpoint.
 *
 * In production, wire this to Cloudinary, S3, or another file host.
 * Below is a minimal Cloudinary integration using their unsigned upload API.
 * Set CLOUDINARY_CLOUD_NAME and a CLOUDINARY_UPLOAD_PRESET in your .env.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ urls: [] });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? "tatbook_references";

    if (!cloudName) {
      // Dev fallback: return placeholder URLs so the booking form still works
      const urls = files.map((_, i) => `https://placehold.co/600x600?text=Reference+${i + 1}`);
      return NextResponse.json({ urls });
    }

    const uploadPromises = files.map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset);
      fd.append("folder", "tatbook/references");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: fd }
      );

      if (!res.ok) throw new Error("Cloudinary upload failed");
      const data = await res.json();
      return data.secure_url as string;
    });

    const urls = await Promise.all(uploadPromises);
    return NextResponse.json({ urls });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
