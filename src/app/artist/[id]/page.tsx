import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import { MapPin, Instagram, Globe, Calendar, Zap, Pencil, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const artist = await prisma.artistProfile.findUnique({ where: { id } });
  if (!artist) return { title: "Artist Not Found" };
  return { title: `${artist.displayName} — TatBook` };
}

export default async function ArtistProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;

  const artist = await prisma.artistProfile.findUnique({
    where: { id },
    include: {
      flashDesigns: { where: { available: true }, orderBy: { sortOrder: "asc" } },
      sizeOptions: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!artist) notFound();

  const portfolioImages = JSON.parse(artist.portfolioImages || "[]") as string[];
  const isOwner = user?.id === artist.userId;

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Artist header */}
        <div className="card p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-2xl bg-obsidian-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {portfolioImages[0] ? (
                <img src={portfolioImages[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-obsidian-500">
                  {artist.displayName[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">{artist.displayName}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-obsidian-400">
                    {artist.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {artist.location}
                      </span>
                    )}
                    {artist.instagramHandle && (
                      <a
                        href={`https://instagram.com/${artist.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-ink-400 transition-colors"
                      >
                        <Instagram className="h-4 w-4" />@{artist.instagramHandle}
                      </a>
                    )}
                    {artist.websiteUrl && (
                      <a
                        href={artist.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-ink-400 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {isOwner && (
                  <Link href="/artist/dashboard/settings" className="btn-secondary gap-2 text-sm">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit profile
                  </Link>
                )}
              </div>

              {artist.bio && (
                <p className="mt-4 text-obsidian-300 leading-relaxed">{artist.bio}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {artist.allowFlash && (
                  <span className="badge bg-ink-900/60 text-ink-300 ring-1 ring-ink-700/40">
                    <Zap className="h-3 w-3 mr-1" />
                    Flash available
                  </span>
                )}
                {artist.allowCustom && (
                  <span className="badge bg-obsidian-800 text-obsidian-300 ring-1 ring-obsidian-700/40">
                    <Pencil className="h-3 w-3 mr-1" />
                    Custom work
                  </span>
                )}
                <span className="badge bg-green-900/30 text-green-400 ring-1 ring-green-700/30">
                  {formatCurrency(artist.depositAmount)} deposit
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio */}
            {portfolioImages.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolioImages.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-obsidian-800">
                      <img src={img} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Flash designs */}
            {artist.allowFlash && artist.flashDesigns.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4">
                  Flash Designs
                  <span className="ml-2 text-sm font-normal text-obsidian-500">
                    ({artist.flashDesigns.length} available)
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {artist.flashDesigns.map((design) => (
                    <div key={design.id} className="card overflow-hidden group">
                      <div className="aspect-square bg-obsidian-800 overflow-hidden">
                        <img
                          src={design.imageUrl}
                          alt={design.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-white text-sm">{design.name}</p>
                        {design.description && (
                          <p className="text-xs text-obsidian-400 mt-1 line-clamp-2">
                            {design.description}
                          </p>
                        )}
                        {design.basePrice && (
                          <p className="text-xs font-semibold text-ink-400 mt-1">
                            Starting at {formatCurrency(design.basePrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 card p-6 space-y-5">
              <h2 className="text-lg font-bold text-white">Book an appointment</h2>

              <div className="space-y-3 text-sm">
                {artist.allowFlash && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-ink-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="h-4 w-4 text-ink-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Flash tattoo</p>
                      <p className="text-obsidian-400">
                        Choose from {artist.flashDesigns.length} available designs
                      </p>
                    </div>
                  </div>
                )}
                {artist.allowCustom && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-obsidian-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Pencil className="h-4 w-4 text-obsidian-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Custom piece</p>
                      <p className="text-obsidian-400">Upload your reference images</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-obsidian-800 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-obsidian-400">Deposit required</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(artist.depositAmount)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-obsidian-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Collected securely via Stripe
                </div>
              </div>

              <Link
                href={`/book/${artist.id}`}
                className="btn-primary w-full gap-2 justify-center"
              >
                Book now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
