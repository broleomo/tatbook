import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createFlashSchema = z.object({
  artistId: z.string(),
  name: z.string().min(1, "Design name is required"),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url("A valid image URL is required"),
  available: z.boolean().default(true),
  basePrice: z.number().positive("Starting price must be a positive number").nullable().optional(),
  maxPrice: z.number().positive("Maximum price must be a positive number").nullable().optional(),
  sizes: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string } | null;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const artist = await prisma.artistProfile.findUnique({ where: { userId: user.id } });
    if (!artist) return NextResponse.json({ error: "Artist profile not found. Please complete your profile setup." }, { status: 404 });

    const body = await req.json();
    const result = createFlashSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Invalid form data", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    if (data.artistId !== artist.id) {
      return NextResponse.json({ error: "You are not authorized to add designs to this profile." }, { status: 403 });
    }

    const count = await prisma.flashDesign.count({ where: { artistId: artist.id } });

    const design = await prisma.flashDesign.create({
      data: {
        artistId: artist.id,
        name: data.name,
        description: data.description ?? null,
        imageUrl: data.imageUrl,
        available: data.available,
        basePrice: data.basePrice ?? null,
        maxPrice: data.maxPrice ?? null,
        sizes: JSON.stringify(data.sizes ?? []),
        sortOrder: count,
      },
    });

    return NextResponse.json({ ...design, sizes: JSON.parse(design.sizes) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/flash error:", err);
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Invalid form data", fields: err.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
