import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { CheckCircle, Calendar, Mail, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ artistId: string }>;
  searchParams: Promise<{ booking?: string; cancelled?: string }>;
}

export default async function ConfirmationPage({ params, searchParams }: PageProps) {
  const { artistId } = await params;
  const { booking: bookingId, cancelled } = await searchParams;

  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;

  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) notFound();

  if (cancelled) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-obsidian-800 flex items-center justify-center">
              <span className="text-3xl">✕</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Payment cancelled</h1>
              <p className="text-obsidian-400 mt-2">
                Your booking was not completed. You can try again or browse other artists.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href={`/book/${artistId}`} className="btn-primary gap-2">
                Try again
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/artists" className="btn-secondary">
                Browse artists
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { flashDesign: { select: { name: true, imageUrl: true } } },
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-green-900/40 ring-1 ring-green-500/30 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Booking requested!</h1>
              <p className="text-obsidian-400 mt-2">
                Your deposit has been received. {artist.displayName} will confirm your appointment shortly.
              </p>
            </div>
          </div>

          {booking && (
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-white">Booking summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-obsidian-400">Artist</span>
                  <span className="text-white font-medium">{artist.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-obsidian-400">Type</span>
                  <span className="text-white font-medium">
                    {booking.bookingType === "FLASH" ? "Flash tattoo" : "Custom tattoo"}
                  </span>
                </div>
                {booking.flashDesign && (
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian-400">Design</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={booking.flashDesign.imageUrl}
                        alt=""
                        className="h-7 w-7 rounded object-cover"
                      />
                      <span className="text-white font-medium">{booking.flashDesign.name}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-obsidian-400">Size</span>
                  <span className="text-white font-medium">{booking.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-obsidian-400">Placement</span>
                  <span className="text-white font-medium">{booking.bodyPlacement}</span>
                </div>
                <div className="border-t border-obsidian-800 pt-3 flex justify-between font-semibold">
                  <span className="text-white">Deposit paid</span>
                  <span className="text-green-400">{formatCurrency(booking.depositAmount)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="card p-5 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-ink-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Confirmation email sent</p>
                <p className="text-xs text-obsidian-400 mt-0.5">
                  Check your inbox for booking details and next steps.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-ink-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">What happens next?</p>
                <p className="text-xs text-obsidian-400 mt-0.5">
                  The artist will review your request and contact you to schedule a date and time.
                </p>
              </div>
            </div>
          </div>

          <Link href="/artists" className="btn-secondary w-full justify-center">
            Browse more artists
          </Link>
        </div>
      </main>
    </div>
  );
}
