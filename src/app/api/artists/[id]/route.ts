import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const sizeOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Size label cannot be empty"),
  price: z.number().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

const customFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Question label cannot be empty"),
  type: z.enum(["text", "textarea", "select"]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

const patchSchema = z.object({
  displayName: z.string().min(1, "Artist/Studio name is required").optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  instagramHandle: z.string().nullable().optional(),
  websiteUrl: z
    .string()
    .url('Website URL must be a full URL starting with "https://" (e.g. https://yoursite.com)')
    .nullable()
    .optional()
    .or(z.literal("")),
  depositAmount: z
    .number()
    .min(0, "Deposit amount must be 0 or more")
    .optional(),
  depositPercent: z.number().nullable().optional(),
  allowFlash: z.boolean().optional(),
  allowCustom: z.boolean().optional(),
  portfolioImages: z
    .array(z.string().url("Each portfolio image must be a valid URL starting with https://"))
    .optional(),
  sizeOptions: z.array(sizeOptionSchema).optional(),
  customFields: z.array(customFieldSchema).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as { id?: string } | null;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const artist = await prisma.artistProfile.findUnique({ where: { id } });
    if (!artist || artist.userId !== user.id) {
      return NextResponse.json({ error: "Profile not found or you do not have permission to edit it." }, { status: 404 });
    }

    const body = await req.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: firstError?.message ?? "Invalid form data", fields: fieldErrors },
        { status: 400 }
      );
    }

    const { sizeOptions, customFields, portfolioImages, ...profileData } = result.data;

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
  } catch (err) {
    console.error("PATCH /api/artists/[id] error:", err);
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? "Invalid form data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
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
