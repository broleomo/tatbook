import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BookingsManager from "@/components/artist/BookingsManager";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;
  if (!user) redirect("/login");

  const artist = await prisma.artistProfile.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        include: {
          flashDesign: { select: { id: true, name: true, imageUrl: true } },
        },
      },
    },
  });

  if (!artist) redirect("/register");

  const bookings = artist.bookings.map((b) => ({
    ...b,
    referenceImages: JSON.parse(b.referenceImages || "[]") as string[],
    appointmentDate: b.appointmentDate?.toISOString() ?? null,
    appointmentEnd: b.appointmentEnd?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="text-obsidian-400 mt-1">Manage all your tattoo appointment requests.</p>
      </div>
      <BookingsManager bookings={bookings} artistId={artist.id} />
    </div>
  );
}
