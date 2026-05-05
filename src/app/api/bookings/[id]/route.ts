import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCalendarEvent } from "@/lib/google-calendar";

const patchSchema = z.object({
  status: z.enum(["PENDING", "DEPOSIT_PAID", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
  appointmentDate: z.string().datetime().optional(),
  appointmentEnd: z.string().datetime().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as { id?: string } | null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artist = await prisma.artistProfile.findUnique({ where: { userId: user.id } });
  if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const booking = await prisma.booking.findFirst({
    where: { id, artistId: artist.id },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const body = await req.json();
  const data = patchSchema.parse(body);

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.appointmentDate && { appointmentDate: new Date(data.appointmentDate) }),
      ...(data.appointmentEnd && { appointmentEnd: new Date(data.appointmentEnd) }),
    },
  });

  // If confirming and calendar is connected, create calendar event
  if (
    data.status === "CONFIRMED" &&
    artist.googleCalendarConnected &&
    artist.googleAccessToken &&
    artist.googleRefreshToken &&
    updated.appointmentDate
  ) {
    try {
      const event = await createCalendarEvent({
        accessToken: artist.googleAccessToken,
        refreshToken: artist.googleRefreshToken,
        calendarId: artist.calendarId ?? "primary",
        summary: `Tattoo Appointment — ${booking.clientName}`,
        description: `${booking.bookingType} tattoo\nSize: ${booking.size}\nPlacement: ${booking.bodyPlacement}${booking.notes ? `\nNotes: ${booking.notes}` : ""}`,
        startTime: updated.appointmentDate,
        endTime: updated.appointmentEnd ?? new Date(updated.appointmentDate.getTime() + 2 * 60 * 60 * 1000),
        attendeeEmail: booking.clientEmail,
      });

      await prisma.booking.update({
        where: { id },
        data: { googleEventId: event.id ?? null },
      });
    } catch (err) {
      console.error("Calendar event creation failed:", err);
    }
  }

  return NextResponse.json(updated);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as { id?: string } | null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artist = await prisma.artistProfile.findUnique({ where: { userId: user.id } });
  if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const booking = await prisma.booking.findFirst({
    where: { id, artistId: artist.id },
    include: { flashDesign: true },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(booking);
}
