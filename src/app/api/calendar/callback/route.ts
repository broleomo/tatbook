import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const artistId = searchParams.get("state");

  if (!code || !artistId) {
    return NextResponse.redirect(
      new URL("/artist/dashboard/calendar?error=missing_params", req.url)
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    await prisma.artistProfile.update({
      where: { id: artistId },
      data: {
        googleCalendarConnected: true,
        googleAccessToken: tokens.access_token ?? null,
        googleRefreshToken: tokens.refresh_token ?? null,
        googleTokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      },
    });

    return NextResponse.redirect(
      new URL("/artist/dashboard/calendar?connected=true", req.url)
    );
  } catch (err) {
    console.error("Calendar OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/artist/dashboard/calendar?error=oauth_failed", req.url)
    );
  }
}
