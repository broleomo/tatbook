import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().optional(),
  available: z.boolean().optional(),
  basePrice: z.number().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

async function getArtistAndVerify(userId: string | undefined, designId: string) {
  if (!userId) return null;
  const design = await prisma.flashDesign.findUnique({
    where: { id: designId },
    include: { artist: { select: { userId: true } } },
  });
  if (!design || design.artist.userId !== userId) return null;
  return design;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as { id?: string } | null;

  const design = await getArtistAndVerify(user?.id, id);
  if (!design) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  const body = await req.json();
  const data = patchSchema.parse(body);

  const updated = await prisma.flashDesign.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as { id?: string } | null;

  const design = await getArtistAndVerify(user?.id, id);
  if (!design) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  await prisma.flashDesign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
