"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FlashBookingSection from "./FlashBookingSection";
import CustomBookingSection from "./CustomBookingSection";
import { Zap, Pencil, CreditCard, ArrowRight, ChevronRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface FlashDesign {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string;
  basePrice?: number | null;
}

interface SizeOption {
  id: string;
  label: string;
  price?: number | null;
}

interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
}

interface Artist {
  id: string;
  displayName: string;
  location?: string | null;
  depositAmount: number;
  allowFlash: boolean;
  allowCustom: boolean;
  customFields: CustomField[];
  sizeOptions: SizeOption[];
  flashDesigns: FlashDesign[];
}

interface Props {
  artist: Artist;
  prefillEmail?: string;
  prefillName?: string;
}

const BODY_PLACEMENTS = [
  "Arm — Upper", "Arm — Forearm", "Arm — Wrist", "Hand / Fingers",
  "Shoulder", "Chest", "Ribs / Side", "Back — Upper", "Back — Lower",
  "Neck", "Behind Ear", "Leg — Thigh", "Leg — Calf", "Ankle / Foot",
  "Stomach / Abdomen", "Hip", "Other",
];

const clientSchema = z.object({
  clientName: z.string().min(2, "Name is required"),
  clientEmail: z.string().email("Valid email required"),
  clientPhone: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

type Step = "type" | "details" | "contact" | "review";

export default function BookingForm({ artist, prefillEmail = "", prefillName = "" }: Props) {
  const [step, setStep] = useState<Step>("type");
  const [bookingType, setBookingType] = useState<"FLASH" | "CUSTOM" | null>(null);
  const [selectedFlashId, setSelectedFlashId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [bodyPlacement, setBodyPlacement] = useState("");
  const [notes, setNotes] = useState("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: { clientName: prefillName, clientEmail: prefillEmail },
  });

  const selectedFlash = artist.flashDesigns.find((d) => d.id === selectedFlashId);
  const selectedSizeOption = artist.sizeOptions.find((s) => s.label === selectedSize);

  const canProceedFromDetails = () => {
    if (!selectedSize || !bodyPlacement) return false;
    if (bookingType === "FLASH" && !selectedFlashId) return false;
    for (const field of artist.customFields) {
      if (field.required && !customFieldValues[field.id]?.trim()) return false;
    }
    return true;
  };

  const onSubmit = async (contactData: ClientForm) => {
    setFormError("");
    setSubmitting(true);
    try {
      let uploadedImages: string[] = [];

      if (referenceImages.length > 0) {
        const formData = new FormData();
        referenceImages.forEach((f) => formData.append("files", f));
        const upRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (upRes.ok) {
          const { urls } = await upRes.json();
          uploadedImages = urls;
        }
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          ...contactData,
          bookingType,
          flashDesignId: bookingType === "FLASH" ? selectedFlashId : null,
          referenceImages: uploadedImages,
          size: selectedSize,
          bodyPlacement,
          notes: notes || null,
          customFieldValues,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? "Booking failed. Please try again.");
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = json.checkoutUrl;
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps: Step[] = ["type", "details", "contact", "review"];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                steps.indexOf(step) >= i
                  ? "bg-ink-600 text-white"
                  : "bg-obsidian-800 text-obsidian-500"
              )}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 w-8 transition-all",
                  steps.indexOf(step) > i ? "bg-ink-600" : "bg-obsidian-800"
                )}
              />
            )}
          </div>
        ))}
        <div className="ml-2 text-sm text-obsidian-400 capitalize">
          {step === "type" && "Tattoo type"}
          {step === "details" && "Tattoo details"}
          {step === "contact" && "Your info"}
          {step === "review" && "Review & pay"}
        </div>
      </div>

      {/* Step 1: Type selection */}
      {step === "type" && (
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">What would you like?</h2>
            <p className="text-obsidian-400 text-sm mt-1">
              Choose between a flash design or a custom piece.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {artist.allowFlash && (
              <TypeCard
                icon={<Zap className="h-6 w-6" />}
                title="Flash tattoo"
                description={`Choose from ${artist.flashDesigns.length} ready-to-ink designs`}
                selected={bookingType === "FLASH"}
                disabled={artist.flashDesigns.length === 0}
                onClick={() => { setBookingType("FLASH"); setSelectedFlashId(null); }}
              />
            )}
            {artist.allowCustom && (
              <TypeCard
                icon={<Pencil className="h-6 w-6" />}
                title="Custom tattoo"
                description="Submit your concept with reference images"
                selected={bookingType === "CUSTOM"}
                onClick={() => { setBookingType("CUSTOM"); setSelectedFlashId(null); }}
              />
            )}
          </div>

          <button
            onClick={() => setStep("details")}
            disabled={!bookingType}
            className="btn-primary w-full gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2: Tattoo details */}
      {step === "details" && (
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              {bookingType === "FLASH" ? "Select your design" : "Your custom idea"}
            </h2>
          </div>

          {bookingType === "FLASH" ? (
            <FlashBookingSection
              designs={artist.flashDesigns}
              selectedId={selectedFlashId}
              onSelect={setSelectedFlashId}
            />
          ) : (
            <CustomBookingSection
              files={referenceImages}
              onChange={setReferenceImages}
            />
          )}

          {/* Size */}
          <div>
            <label className="label">Size *</label>
            {artist.sizeOptions.length > 0 ? (
              <select
                className="input-field"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Select a size…</option>
                {artist.sizeOptions.map((opt) => (
                  <option key={opt.id} value={opt.label}>
                    {opt.label}{opt.price ? ` — $${opt.price}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Small (2 inches)"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              />
            )}
          </div>

          {/* Body placement */}
          <div>
            <label className="label">Body placement *</label>
            <select
              className="input-field"
              value={bodyPlacement}
              onChange={(e) => setBodyPlacement(e.target.value)}
            >
              <option value="">Select placement…</option>
              {BODY_PLACEMENTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Custom fields from artist */}
          {artist.customFields.map((field) => (
            <div key={field.id}>
              <label className="label">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  className="input-field"
                  value={customFieldValues[field.id] ?? ""}
                  onChange={(e) =>
                    setCustomFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                >
                  <option value="">Select…</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  rows={3}
                  className="input-field resize-none"
                  value={customFieldValues[field.id] ?? ""}
                  onChange={(e) =>
                    setCustomFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                />
              ) : (
                <input
                  type="text"
                  className="input-field"
                  value={customFieldValues[field.id] ?? ""}
                  onChange={(e) =>
                    setCustomFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}

          {/* Notes */}
          <div>
            <label className="label">Additional notes (optional)</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="Any other details for the artist…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep("type")} className="btn-secondary">
              Back
            </button>
            <button
              onClick={() => setStep("contact")}
              disabled={!canProceedFromDetails()}
              className="btn-primary flex-1 gap-2"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Contact info */}
      {step === "contact" && (
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Your information</h2>
            <p className="text-obsidian-400 text-sm mt-1">
              The artist will use this to confirm your appointment.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Full name *</label>
              <input type="text" className="input-field" {...register("clientName")} />
              {errors.clientName && (
                <p className="mt-1 text-xs text-red-400">{errors.clientName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Email address *</label>
              <input type="email" className="input-field" {...register("clientEmail")} />
              {errors.clientEmail && (
                <p className="mt-1 text-xs text-red-400">{errors.clientEmail.message}</p>
              )}
            </div>
            <div>
              <label className="label">Phone number (optional)</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+1 (555) 000-0000"
                {...register("clientPhone")}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep("details")} className="btn-secondary">
              Back
            </button>
            <button
              onClick={async () => {
                const valid = await trigger();
                if (valid) setStep("review");
              }}
              className="btn-primary flex-1 gap-2"
            >
              Review booking
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Pay */}
      {step === "review" && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">Review your booking</h2>

              <div className="space-y-3 text-sm">
                <ReviewRow label="Artist" value={artist.displayName} />
                <ReviewRow
                  label="Type"
                  value={bookingType === "FLASH" ? "Flash tattoo" : "Custom tattoo"}
                />
                {bookingType === "FLASH" && selectedFlash && (
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian-400">Design</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedFlash.imageUrl}
                        alt={selectedFlash.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                      <span className="text-white font-medium">{selectedFlash.name}</span>
                    </div>
                  </div>
                )}
                {bookingType === "CUSTOM" && referenceImages.length > 0 && (
                  <ReviewRow
                    label="Reference images"
                    value={`${referenceImages.length} image${referenceImages.length > 1 ? "s" : ""}`}
                  />
                )}
                <ReviewRow label="Size" value={selectedSize} />
                <ReviewRow label="Placement" value={bodyPlacement} />
                {notes && <ReviewRow label="Notes" value={notes} />}
              </div>

              <div className="border-t border-obsidian-800 pt-4 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-white">Deposit due now</span>
                  <span className="text-ink-400 text-lg">{formatCurrency(artist.depositAmount)}</span>
                </div>
                <p className="text-xs text-obsidian-500">
                  Remaining balance is settled with your artist on the day of your appointment.
                </p>
              </div>
            </div>

            {formError && (
              <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-sm text-red-400">
                {formError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("contact")}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {submitting ? "Processing…" : `Pay ${formatCurrency(artist.depositAmount)} deposit`}
              </button>
            </div>

            <p className="text-center text-xs text-obsidian-500">
              You&apos;ll be redirected to Stripe&apos;s secure checkout. Your deposit confirms your
              booking request.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

function TypeCard({
  icon,
  title,
  description,
  selected,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-start gap-4 rounded-xl border p-5 text-left transition-all",
        selected
          ? "border-ink-500 bg-ink-900/30 ring-1 ring-ink-500/30"
          : "border-obsidian-700 bg-obsidian-900 hover:border-obsidian-600",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "rounded-xl p-3",
          selected ? "bg-ink-600 text-white" : "bg-obsidian-800 text-obsidian-400"
        )}
      >
        {icon}
      </div>
      <div>
        <p className="font-bold text-white">{title}</p>
        <p className="text-sm text-obsidian-400 mt-1">{description}</p>
      </div>
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-obsidian-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
