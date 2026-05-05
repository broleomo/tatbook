import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;

  if (!user) redirect("/login?callbackUrl=/artist/dashboard");
  if (user.role !== "ARTIST") redirect("/");

  const artist = await prisma.artistProfile.findUnique({
    where: { userId: user.id },
  });

  if (!artist) redirect("/register");

  return (
    <div className="flex min-h-screen bg-obsidian-950">
      <DashboardSidebar artistId={artist.id} displayName={artist.displayName} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
