"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string | null;
  status: string;
}

interface Props {
  events: CalendarEvent[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500",
  DEPOSIT_PAID: "bg-blue-500",
  CONFIRMED: "bg-ink-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500/50",
};

export default function CalendarView({ events }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.start), day));

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-obsidian-400 hover:text-white hover:bg-obsidian-800 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-obsidian-400 hover:text-white hover:bg-obsidian-800 transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-obsidian-400 hover:text-white hover:bg-obsidian-800 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-obsidian-500 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-obsidian-800 rounded-xl overflow-hidden">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-obsidian-900/50 aspect-square" />
          ))}

          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const today = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                className={cn(
                  "bg-obsidian-900 p-2 aspect-square flex flex-col items-start gap-1 transition-all hover:bg-obsidian-800",
                  isSelected && "bg-ink-900/40 ring-inset ring-1 ring-ink-500"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
                    today && "bg-ink-600 text-white",
                    !today && "text-obsidian-300",
                    isSelected && !today && "text-ink-300"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="flex flex-wrap gap-0.5 w-full">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className={cn(
                        "h-1.5 rounded-full flex-1 min-w-[4px]",
                        STATUS_COLORS[e.status] ?? "bg-obsidian-600"
                      )}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-obsidian-500">+{dayEvents.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event detail sidebar */}
      <div className="card p-6">
        <h3 className="font-bold text-white mb-4">
          {selectedDay ? format(selectedDay, "EEEE, MMMM d") : "Select a day"}
        </h3>

        {!selectedDay ? (
          <p className="text-sm text-obsidian-500">
            Click on a day to see appointments.
          </p>
        ) : selectedEvents.length === 0 ? (
          <p className="text-sm text-obsidian-500">No appointments on this day.</p>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <div key={event.id} className="rounded-lg bg-obsidian-800 p-3">
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0",
                      STATUS_COLORS[event.status] ?? "bg-obsidian-600"
                    )}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{event.title}</p>
                    <p className="flex items-center gap-1 text-xs text-obsidian-400 mt-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.start), "h:mm a")}
                      {event.end && ` – ${format(new Date(event.end), "h:mm a")}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-obsidian-800 space-y-1.5">
          <p className="text-xs font-medium text-obsidian-500 uppercase tracking-wide mb-2">
            Status
          </p>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${color}`} />
              <span className="text-xs text-obsidian-400 capitalize">
                {status.replace("_", " ").toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
