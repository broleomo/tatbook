import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ArtistSettingsForm from "@/components/artist/ArtistSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;
  if (!user) redirect("/login");

  const artist = await prisma.artistProfile.findUnique({
    where: { userId: user.id },
    include: { sizeOptions: { orderBy: { sortOrder: "asc" } } },
  });

  if (!artist) redirect("/register");

  const data = {
    id: artist.id,
    displayName: artist.displayName,
    bio: artist.bio ?? "",
    location: artist.location ?? "",
    instagramHandle: artist.instagramHandle ?? "",
    websiteUrl: artist.websiteUrl ?? "",
    portfolioImages: JSON.parse(artist.portfolioImages || "[]") as string[],
    depositAmount: artist.depositAmount,
    depositPercent: artist.depositPercent ?? null,
    allowFlash: artist.allowFlash,
    allowCustom: artist.allowCustom,
    customFields: JSON.parse(artist.customFields || "[]"),
    sizeOptions: artist.sizeOptions.map((s) => ({
      id: s.id,
      label: s.label,
      price: s.price ?? null,
      sortOrder: s.sortOrder,
    })),
  };

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-obsidian-400 mt-1">
          Customize your profile and booking form.
        </p>
      </div>
      <ArtistSettingsForm artist={data} />
    </div>
  );
}
