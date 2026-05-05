import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const sizeOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  price: z.number().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

const customFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["text", "textarea", "select"]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

const patchSchema = z.object({
  displayName: z.string().min(1).optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  instagramHandle: z.string().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional().or(z.literal("")),
  depositAmount: z.number().positive().optional(),
  depositPercent: z.number().nullable().optional(),
  allowFlash: z.boolean().optional(),
  allowCustom: z.boolean().optional(),
  portfolioImages: z.array(z.string().url()).optional(),
  sizeOptions: z.array(sizeOptionSchema).optional(),
  customFields: z.array(customFieldSchema).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as { id?: string } | null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artist = await prisma.artistProfile.findUnique({ where: { id } });
  if (!artist || artist.userId !== user.id) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  }

  const body = await req.json();
  const data = patchSchema.parse(body);

  const { sizeOptions, customFields, portfolioImages, ...profileData } = data;

  await prisma.$transaction(async (tx) => {
    await tx.artistProfile.update({
      where: { id },
      data: {
        ...profileData,
        portfolioImages: portfolioImages ? JSON.stringify(portfolioImages) : undefined,
        customFields: customFields ? JSON.stringify(customFields) : undefined,
        websiteUrl: profileData.websiteUrl === "" ? null : profileData.websiteUrl,
      },
    });

    if (sizeOptions !== undefined) {
      await tx.sizeOption.deleteMany({ where: { artistId: id } });
      if (sizeOptions.length > 0) {
        await tx.sizeOption.createMany({
          data: sizeOptions.map((opt, i) => ({
            artistId: id,
            label: opt.label,
            price: opt.price ?? null,
            sortOrder: i,
          })),
        });
      }
    }
  });

  const updated = await prisma.artistProfile.findUnique({
    where: { id },
    include: { sizeOptions: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(updated);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const artist = await prisma.artistProfile.findUnique({
    where: { id },
    include: {
      flashDesigns: { where: { available: true }, orderBy: { sortOrder: "asc" } },
      sizeOptions: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(artist);
}
