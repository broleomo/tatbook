"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { Check } from "lucide-react";

interface FlashDesign {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string;
  basePrice?: number | null;
}

interface Props {
  designs: FlashDesign[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function FlashBookingSection({ designs, selectedId, onSelect }: Props) {
  if (designs.length === 0) {
    return (
      <div className="rounded-xl border border-obsidian-700 p-8 text-center text-obsidian-500">
        No flash designs available at this time.
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-obsidian-400 mb-4">
        Select the design you&apos;d like to get:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {designs.map((design) => (
          <button
            key={design.id}
            type="button"
            onClick={() => onSelect(design.id)}
            className={cn(
              "relative rounded-xl border overflow-hidden text-left transition-all group",
              selectedId === design.id
                ? "border-ink-500 ring-2 ring-ink-500/30"
                : "border-obsidian-700 hover:border-obsidian-500"
            )}
          >
            {/* Selection indicator */}
            {selectedId === design.id && (
              <div className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-ink-600 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            )}

            {/* Image */}
            <div className="aspect-square bg-obsidian-800 overflow-hidden">
              <img
                src={design.imageUrl}
                alt={design.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-sm font-semibold text-white leading-tight">{design.name}</p>
              {design.description && (
                <p className="text-xs text-obsidian-400 mt-1 line-clamp-2">{design.description}</p>
              )}
              {design.basePrice != null && (
                <p className="text-xs font-semibold text-ink-400 mt-1">
                  From {formatCurrency(design.basePrice)}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
