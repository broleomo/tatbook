import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthUrl } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string } | null;
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const artist = await prisma.artistProfile.findUnique({ where: { userId: user.id } });
  if (!artist) return NextResponse.redirect(new URL("/register", req.url));

  const authUrl = getAuthUrl(artist.id);
  return NextResponse.redirect(authUrl);
}
