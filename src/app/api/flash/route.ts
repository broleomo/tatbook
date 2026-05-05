import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createFlashSchema = z.object({
  artistId: z.string(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url(),
  available: z.boolean().default(true),
  basePrice: z.number().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string } | null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artist = await prisma.artistProfile.findUnique({ where: { userId: user.id } });
  if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data = createFlashSchema.parse(body);

  if (data.artistId !== artist.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
      sortOrder: count,
    },
  });

  return NextResponse.json(design, { status: 201 });
}
