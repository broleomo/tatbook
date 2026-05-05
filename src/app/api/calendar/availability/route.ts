import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const artistId = searchParams.get("artistId");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  if (!artistId || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const artist = await prisma.artistProfile.findUnique({
    where: { id: artistId },
    select: {
      googleCalendarConnected: true,
      googleAccessToken: true,
      googleRefreshToken: true,
      calendarId: true,
    },
  });

  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  if (!artist.googleCalendarConnected || !artist.googleAccessToken || !artist.googleRefreshToken) {
    return NextResponse.json({ busy: [] });
  }

  try {
    const busySlots = await getAvailableSlots({
      accessToken: artist.googleAccessToken,
      refreshToken: artist.googleRefreshToken,
      calendarId: artist.calendarId ?? "primary",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json({ busy: busySlots });
  } catch (err) {
    console.error("Availability check failed:", err);
    return NextResponse.json({ busy: [] });
  }
}
