import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";
import ConnectCalendarButton from "@/components/calendar/ConnectCalendarButton";
import { getAuthUrl } from "@/lib/google-calendar";
import { CalendarDays, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;
  if (!user) redirect("/login");

  const artist = await prisma.artistProfile.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        where: {
          appointmentDate: { not: null },
          status: { notIn: ["CANCELLED"] },
        },
        select: {
          id: true,
          clientName: true,
          appointmentDate: true,
          appointmentEnd: true,
          bookingType: true,
          status: true,
        },
      },
    },
  });

  if (!artist) redirect("/register");

  const authUrl = getAuthUrl(artist.id);
  const events = artist.bookings.map((b) => ({
    id: b.id,
    title: `${b.clientName} — ${b.bookingType}`,
    start: b.appointmentDate!.toISOString(),
    end: b.appointmentEnd?.toISOString() ?? null,
    status: b.status,
  }));

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <p className="text-obsidian-400 mt-1">Manage your availability and scheduled appointments.</p>
      </div>

      {/* Calendar connection status */}
      <div className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              artist.googleCalendarConnected
                ? "bg-green-900/40 text-green-400"
                : "bg-obsidian-800 text-obsidian-400"
            }`}>
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-white">Google Calendar</p>
              {artist.googleCalendarConnected ? (
                <div className="flex items-center gap-1.5 text-sm text-green-400 mt-0.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Connected — appointments sync automatically
                </div>
              ) : (
                <p className="text-sm text-obsidian-400 mt-0.5">
                  Connect to show clients your real-time availability
                </p>
              )}
            </div>
          </div>
          <ConnectCalendarButton
            connected={artist.googleCalendarConnected}
            authUrl={authUrl}
          />
        </div>
      </div>

      <CalendarView events={events} />
    </div>
  );
}
