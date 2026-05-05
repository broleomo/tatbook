import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FlashDesignManager from "@/components/artist/FlashDesignManager";

export const dynamic = "force-dynamic";

export default async function FlashPage() {
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;
  if (!user) redirect("/login");

  const artist = await prisma.artistProfile.findUnique({
    where: { userId: user.id },
    include: {
      flashDesigns: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!artist) redirect("/register");

  const designs = artist.flashDesigns.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    imageUrl: d.imageUrl,
    available: d.available,
    basePrice: d.basePrice,
    sortOrder: d.sortOrder,
  }));

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Flash Designs</h1>
        <p className="text-obsidian-400 mt-1">
          Manage your available flash tattoo designs. Clients can browse and select these when booking.
        </p>
      </div>
      <FlashDesignManager designs={designs} artistId={artist.id} />
    </div>
  );
}
