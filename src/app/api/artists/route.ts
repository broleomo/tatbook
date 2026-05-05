import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const artists = await prisma.artistProfile.findMany({
    where: search
      ? {
          OR: [
            { displayName: { contains: search } },
            { location: { contains: search } },
            { bio: { contains: search } },
          ],
        }
      : undefined,
    take: Math.min(limit, 50),
    orderBy: { createdAt: "desc" },
    include: {
      flashDesigns: {
        where: { available: true },
        take: 3,
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, imageUrl: true },
      },
    },
  });

  return NextResponse.json(artists);
}
