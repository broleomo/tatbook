import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import BookingForm from "@/components/booking/BookingForm";
import { formatCurrency } from "@/lib/utils";
import { MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ artistId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { artistId } = await params;
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) return { title: "Artist Not Found" };
  return { title: `Book with ${artist.displayName} — TatBook` };
}

export default async function BookingPage({ params }: PageProps) {
  const { artistId } = await params;
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;

  const artist = await prisma.artistProfile.findUnique({
    where: { id: artistId },
    include: {
      flashDesigns: { where: { available: true }, orderBy: { sortOrder: "asc" } },
      sizeOptions: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!artist) notFound();

  const artistData = {
    id: artist.id,
    displayName: artist.displayName,
    location: artist.location,
    depositAmount: artist.depositAmount,
    allowFlash: artist.allowFlash,
    allowCustom: artist.allowCustom,
    customFields: JSON.parse(artist.customFields || "[]"),
    sizeOptions: artist.sizeOptions.map((s) => ({
      id: s.id,
      label: s.label,
      price: s.price,
    })),
    flashDesigns: artist.flashDesigns.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      imageUrl: d.imageUrl,
      basePrice: d.basePrice,
    })),
  };

  const prefillEmail = user?.email ?? "";
  const prefillName = user?.name ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href={`/artist/${artistId}`}
          className="inline-flex items-center gap-1.5 text-sm text-obsidian-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Book with {artist.displayName}
          </h1>
          <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-obsidian-400">
            {artist.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {artist.location}
              </span>
            )}
            <span className="text-obsidian-600">·</span>
            <span>
              {formatCurrency(artist.depositAmount)} deposit required via Stripe
            </span>
          </div>
        </div>

        <BookingForm
          artist={artistData}
          prefillEmail={prefillEmail}
          prefillName={prefillName}
        />
      </main>
    </div>
  );
}
