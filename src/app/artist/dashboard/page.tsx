import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as typeof session.user & { role?: string; id?: string } | null;
  if (!user) redirect("/login");

  const artist = await prisma.artistProfile.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { flashDesign: { select: { name: true } } },
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!artist) redirect("/register");

  const bookings = artist.bookings;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "DEPOSIT_PAID").length;
  const totalDepositsCollected = bookings
    .filter((b) => b.depositPaid)
    .reduce((sum, b) => sum + b.depositAmount, 0);

  const upcoming = bookings
    .filter((b) => b.appointmentDate && new Date(b.appointmentDate) > new Date())
    .slice(0, 5);

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {getTimeOfDay()}, {artist.displayName}
        </h1>
        <p className="text-obsidian-400 mt-1">Here&apos;s what&apos;s happening with your bookings.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Total bookings"
          value={artist._count.bookings}
          color="ink"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Pending review"
          value={pendingCount}
          color="yellow"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Confirmed"
          value={confirmedCount}
          color="green"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Deposits collected"
          value={formatCurrency(totalDepositsCollected)}
          color="purple"
        />
      </div>

      {/* Upcoming appointments */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-ink-400" />
              Upcoming appointments
            </h2>
            <Link href="/artist/dashboard/calendar" className="text-sm text-ink-400 hover:text-ink-300 flex items-center gap-1">
              View calendar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-obsidian-500 text-sm py-4">No upcoming appointments scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start gap-3 rounded-lg bg-obsidian-800/50 p-3"
                >
                  <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-ink-900/60 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-ink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{booking.clientName}</p>
                    <p className="text-xs text-obsidian-400">
                      {booking.bookingType === "FLASH"
                        ? `Flash: ${booking.flashDesign?.name ?? "—"}`
                        : "Custom tattoo"}
                    </p>
                    {booking.appointmentDate && (
                      <p className="text-xs text-ink-400 mt-0.5">
                        {formatDate(booking.appointmentDate)}
                      </p>
                    )}
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-ink-400" />
              Recent requests
            </h2>
            <Link href="/artist/dashboard/bookings" className="text-sm text-ink-400 hover:text-ink-300 flex items-center gap-1">
              All bookings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-obsidian-500 text-sm">No bookings yet.</p>
              <p className="text-obsidian-600 text-xs">
                Share your profile to start receiving booking requests.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <Link
                  key={booking.id}
                  href={`/artist/dashboard/bookings`}
                  className="flex items-center gap-3 rounded-lg bg-obsidian-800/50 p-3 hover:bg-obsidian-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{booking.clientName}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-obsidian-700 text-obsidian-300">
                        {booking.bookingType}
                      </span>
                    </div>
                    <p className="text-xs text-obsidian-400">{booking.size} · {booking.bodyPlacement}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <BookingStatusBadge status={booking.status} />
                    <p className="text-xs text-obsidian-500">
                      {formatCurrency(booking.depositAmount)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick setup reminder */}
      {!artist.googleCalendarConnected && (
        <div className="rounded-xl border border-ink-700/40 bg-ink-900/20 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">Connect Google Calendar</p>
            <p className="text-sm text-obsidian-400 mt-0.5">
              Sync your availability so clients can see open slots.
            </p>
          </div>
          <Link href="/artist/dashboard/calendar" className="btn-primary text-sm px-4 py-2 whitespace-nowrap">
            Connect now
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "ink" | "yellow" | "green" | "purple";
}) {
  const colorMap = {
    ink: "bg-ink-900/50 text-ink-400 ring-ink-700/30",
    yellow: "bg-yellow-900/30 text-yellow-400 ring-yellow-700/30",
    green: "bg-green-900/30 text-green-400 ring-green-700/30",
    purple: "bg-purple-900/30 text-purple-400 ring-purple-700/30",
  };

  return (
    <div className="card p-5 space-y-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ring-1 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-obsidian-400">{label}</p>
      </div>
    </div>
  );
}

function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "badge-pending",
    DEPOSIT_PAID: "badge-paid",
    CONFIRMED: "badge-confirmed",
    COMPLETED: "badge-completed",
    CANCELLED: "badge-cancelled",
  };
  const label: Record<string, string> = {
    PENDING: "Pending",
    DEPOSIT_PAID: "Deposit paid",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return <span className={map[status] ?? "badge"}>{label[status] ?? status}</span>;
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
