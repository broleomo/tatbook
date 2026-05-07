import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { auth } from "@/lib/auth";

const createBookingSchema = z.object({
  artistId: z.string(),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional().nullable(),
  bookingType: z.enum(["FLASH", "CUSTOM"]),
  flashDesignId: z.string().optional().nullable(),
  referenceImages: z.array(z.string()).max(3).default([]),
  size: z.string().min(1),
  bodyPlacement: z.string().min(1),
  notes: z.string().optional().nullable(),
  customFieldValues: z.record(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createBookingSchema.parse(body);

    const session = await auth();
    const user = session?.user as { id?: string } | null;

    const artist = await prisma.artistProfile.findUnique({
      where: { id: data.artistId },
      select: {
        id: true,
        displayName: true,
        depositAmount: true,
        allowFlash: true,
        allowCustom: true,
      },
    });

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    if (data.bookingType === "FLASH" && !artist.allowFlash) {
      return NextResponse.json({ error: "Artist does not accept flash bookings" }, { status: 400 });
    }
    if (data.bookingType === "CUSTOM" && !artist.allowCustom) {
      return NextResponse.json({ error: "Artist does not accept custom bookings" }, { status: 400 });
    }

    if (data.bookingType === "FLASH" && !data.flashDesignId) {
      return NextResponse.json({ error: "Flash design must be selected" }, { status: 400 });
    }

    if (data.bookingType === "FLASH" && data.flashDesignId) {
      const flash = await prisma.flashDesign.findUnique({
        where: { id: data.flashDesignId },
        select: { available: true },
      });
      if (!flash) {
        return NextResponse.json({ error: "The selected flash design no longer exists." }, { status: 404 });
      }
      if (!flash.available) {
        return NextResponse.json({ error: "This flash design is no longer available for booking. Please choose another." }, { status: 400 });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        artistId: data.artistId,
        clientId: user?.id ?? null,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone ?? null,
        bookingType: data.bookingType,
        flashDesignId: data.flashDesignId ?? null,
        referenceImages: JSON.stringify(data.referenceImages),
        size: data.size,
        bodyPlacement: data.bodyPlacement,
        notes: data.notes ?? null,
        depositAmount: artist.depositAmount,
        status: "PENDING",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const checkoutSession = await createCheckoutSession({
      bookingId: booking.id,
      artistName: artist.displayName,
      bookingType: data.bookingType,
      depositAmount: artist.depositAmount,
      clientEmail: data.clientEmail,
      successUrl: `${appUrl}/book/${data.artistId}/confirmation?booking=${booking.id}`,
      cancelUrl: `${appUrl}/book/${data.artistId}/confirmation?cancelled=true`,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url, bookingId: booking.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artist = await prisma.artistProfile.findUnique({ where: { userId: user.id } });
  if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bookings = await prisma.booking.findMany({
    where: { artistId: artist.id },
    include: { flashDesign: { select: { id: true, name: true, imageUrl: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}
