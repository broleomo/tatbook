import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import { MapPin, Instagram, ArrowRight, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;

  const artists = await prisma.artistProfile.findMany({
    include: {
      flashDesigns: { where: { available: true }, take: 3, orderBy: { sortOrder: "asc" } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Tattoo Artists</h1>
            <p className="mt-1 text-obsidian-400">
              {artists.length} artist{artists.length !== 1 ? "s" : ""} available to book
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-obsidian-500" />
            <input
              type="search"
              placeholder="Search artists…"
              className="input-field pl-10 w-64"
            />
          </div>
        </div>

        {artists.length === 0 ? (
          <div className="text-center py-24 text-obsidian-500">
            <p className="text-lg">No artists have signed up yet.</p>
            <Link href="/register" className="btn-primary mt-4 inline-flex">
              Be the first artist
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => {
              const portfolioImages = JSON.parse(artist.portfolioImages || "[]") as string[];
              return (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="card-hover overflow-hidden group"
                >
                  {/* Hero image */}
                  <div className="aspect-[4/3] bg-obsidian-800 overflow-hidden relative">
                    {portfolioImages[0] ? (
                      <img
                        src={portfolioImages[0]}
                        alt={artist.displayName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-obsidian-600">
                        <span className="text-4xl font-bold">
                          {artist.displayName[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Flash badge */}
                    {artist.allowFlash && artist.flashDesigns.length > 0 && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center rounded-full bg-ink-600/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
                          Flash available
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h2 className="text-lg font-bold text-white group-hover:text-ink-300 transition-colors">
                        {artist.displayName}
                      </h2>
                      {artist.location && (
                        <div className="flex items-center gap-1 text-sm text-obsidian-400 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {artist.location}
                        </div>
                      )}
                    </div>

                    {artist.bio && (
                      <p className="text-sm text-obsidian-400 line-clamp-2">{artist.bio}</p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3 text-xs text-obsidian-500">
                        {artist.allowFlash && <span>Flash</span>}
                        {artist.allowFlash && artist.allowCustom && (
                          <span className="text-obsidian-700">·</span>
                        )}
                        {artist.allowCustom && <span>Custom</span>}
                        {artist.instagramHandle && (
                          <>
                            <span className="text-obsidian-700">·</span>
                            <span className="flex items-center gap-1">
                              <Instagram className="h-3 w-3" />@{artist.instagramHandle}
                            </span>
                          </>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-ink-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
