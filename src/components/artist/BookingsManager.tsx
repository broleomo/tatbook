"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  Check,
  X,
  Calendar,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Image,
} from "lucide-react";

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  bookingType: string;
  flashDesign?: { id: string; name: string; imageUrl: string } | null;
  referenceImages: string[];
  size: string;
  bodyPlacement: string;
  notes?: string | null;
  appointmentDate?: string | null;
  depositAmount: number;
  depositPaid: boolean;
  status: string;
  createdAt: string;
}

interface Props {
  bookings: Booking[];
  artistId: string;
}

const STATUS_FILTERS = ["All", "PENDING", "DEPOSIT_PAID", "CONFIRMED", "COMPLETED", "CANCELLED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  DEPOSIT_PAID: "Deposit Paid",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-pending",
  DEPOSIT_PAID: "badge-paid",
  CONFIRMED: "badge-confirmed",
  COMPLETED: "badge-completed",
  CANCELLED: "badge-cancelled",
};

export default function BookingsManager({ bookings: initialBookings, artistId }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdating(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-obsidian-500" />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-obsidian-500" />
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? "bg-ink-600 text-white"
                    : "bg-obsidian-800 text-obsidian-400 hover:text-white"
                }`}
              >
                {s === "All" ? "All" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-obsidian-500">
          No bookings match your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="card overflow-hidden">
              {/* Summary row */}
              <button
                onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-obsidian-800/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <div>
                    <p className="font-semibold text-white">{booking.clientName}</p>
                    <p className="text-xs text-obsidian-400">{booking.clientEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-obsidian-300">
                      {booking.bookingType === "FLASH"
                        ? `Flash: ${booking.flashDesign?.name ?? "—"}`
                        : "Custom tattoo"}
                    </p>
                    <p className="text-xs text-obsidian-500">
                      {booking.size} · {booking.bodyPlacement}
                    </p>
                  </div>
                  <div>
                    {booking.appointmentDate ? (
                      <p className="text-sm text-obsidian-300">
                        {new Date(booking.appointmentDate).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-obsidian-600">No date set</p>
                    )}
                    <p className="text-xs text-obsidian-500">
                      {formatCurrency(booking.depositAmount)} deposit
                      {booking.depositPaid && " ✓"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={STATUS_COLORS[booking.status] ?? "badge"}>
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </span>
                  </div>
                </div>
                {expandedId === booking.id ? (
                  <ChevronUp className="h-4 w-4 text-obsidian-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-obsidian-500 flex-shrink-0" />
                )}
              </button>

              {/* Expanded detail */}
              {expandedId === booking.id && (
                <div className="border-t border-obsidian-800 p-5 space-y-5 bg-obsidian-900/50">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <p className="text-xs font-medium text-obsidian-500 uppercase tracking-wide mb-2">
                        Client info
                      </p>
                      <div className="space-y-1.5">
                        <p className="text-sm text-white font-semibold">{booking.clientName}</p>
                        <a
                          href={`mailto:${booking.clientEmail}`}
                          className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-300"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {booking.clientEmail}
                        </a>
                        {booking.clientPhone && (
                          <a
                            href={`tel:${booking.clientPhone}`}
                            className="flex items-center gap-1.5 text-sm text-obsidian-300 hover:text-white"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {booking.clientPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-obsidian-500 uppercase tracking-wide mb-2">
                        Tattoo details
                      </p>
                      <div className="space-y-1 text-sm text-obsidian-300">
                        <p>Type: <span className="text-white">{booking.bookingType}</span></p>
                        <p>Size: <span className="text-white">{booking.size}</span></p>
                        <p>Placement: <span className="text-white">{booking.bodyPlacement}</span></p>
                        {booking.notes && (
                          <p className="mt-2 text-obsidian-400 italic">&ldquo;{booking.notes}&rdquo;</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-obsidian-500 uppercase tracking-wide mb-2">
                        Payment
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="text-obsidian-300">
                          Deposit: <span className="text-white font-semibold">
                            {formatCurrency(booking.depositAmount)}
                          </span>
                        </p>
                        <p className={booking.depositPaid ? "text-green-400" : "text-yellow-400"}>
                          {booking.depositPaid ? "✓ Deposit received" : "⏳ Awaiting deposit"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reference / flash images */}
                  {(booking.referenceImages.length > 0 || booking.flashDesign) && (
                    <div>
                      <p className="text-xs font-medium text-obsidian-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Image className="h-3.5 w-3.5" />
                        {booking.bookingType === "FLASH" ? "Flash design" : "Reference images"}
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        {booking.flashDesign && (
                          <img
                            src={booking.flashDesign.imageUrl}
                            alt={booking.flashDesign.name}
                            className="h-24 w-24 object-cover rounded-lg border border-obsidian-700"
                          />
                        )}
                        {booking.referenceImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Reference ${i + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border border-obsidian-700"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-obsidian-800">
                    {booking.status === "PENDING" && (
                      <button
                        onClick={() => updateStatus(booking.id, "CONFIRMED")}
                        disabled={updating === booking.id}
                        className="btn-primary text-sm py-2 px-4 gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Confirm booking
                      </button>
                    )}
                    {booking.status === "DEPOSIT_PAID" && (
                      <button
                        onClick={() => updateStatus(booking.id, "CONFIRMED")}
                        disabled={updating === booking.id}
                        className="btn-primary text-sm py-2 px-4 gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark confirmed
                      </button>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <button
                        onClick={() => updateStatus(booking.id, "COMPLETED")}
                        disabled={updating === booking.id}
                        className="btn-secondary text-sm py-2 px-4 gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark completed
                      </button>
                    )}
                    {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                      <button
                        onClick={() => updateStatus(booking.id, "CANCELLED")}
                        disabled={updating === booking.id}
                        className="btn-danger text-sm py-2 px-4 gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    )}
                    <a
                      href={`mailto:${booking.clientEmail}?subject=Your TatBook appointment`}
                      className="btn-ghost text-sm py-2 px-4 gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email client
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
