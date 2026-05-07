import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().min(1, "Design name is required").optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url("A valid image URL is required").optional(),
  available: z.boolean().optional(),
  basePrice: z.number().positive("Price must be a positive number").nullable().optional(),
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
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as { id?: string } | null;

    const design = await getArtistAndVerify(user?.id, id);
    if (!design) return NextResponse.json({ error: "Design not found or you do not have permission to edit it." }, { status: 404 });

    const body = await req.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message ?? "Invalid data" }, { status: 400 });
    }

    const updated = await prisma.flashDesign.update({ where: { id }, data: result.data });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/flash/[id] error:", err);
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as { id?: string } | null;

    const design = await getArtistAndVerify(user?.id, id);
    if (!design) return NextResponse.json({ error: "Design not found or you do not have permission to delete it." }, { status: 404 });

    await prisma.flashDesign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/flash/[id] error:", err);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
