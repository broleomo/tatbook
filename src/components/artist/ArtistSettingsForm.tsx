"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Save, AlertCircle, CheckCircle } from "lucide-react";

interface SizeOption {
  id: string;
  label: string;
  price?: number | null;
  sortOrder: number;
}

interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
}

interface ArtistData {
  id: string;
  displayName: string;
  bio: string;
  location: string;
  instagramHandle: string;
  websiteUrl: string;
  portfolioImages: string[];
  depositAmount: number;
  depositPercent?: number | null;
  allowFlash: boolean;
  allowCustom: boolean;
  customFields: CustomField[];
  sizeOptions: SizeOption[];
}

export default function ArtistSettingsForm({ artist }: { artist: ArtistData }) {
  const [form, setForm] = useState({
    displayName: artist.displayName,
    bio: artist.bio,
    location: artist.location,
    instagramHandle: artist.instagramHandle,
    websiteUrl: artist.websiteUrl,
    depositAmount: artist.depositAmount.toString(),
    allowFlash: artist.allowFlash,
    allowCustom: artist.allowCustom,
  });

  const [portfolioImages, setPortfolioImages] = useState<string[]>(artist.portfolioImages);
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");

  const [sizeOptions, setSizeOptions] = useState<SizeOption[]>(artist.sizeOptions);
  const [newSize, setNewSize] = useState({ label: "", price: "" });

  const [customFields, setCustomFields] = useState<CustomField[]>(artist.customFields);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const save = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch(`/api/artists/${artist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          bio: form.bio || null,
          location: form.location || null,
          instagramHandle: form.instagramHandle || null,
          websiteUrl: form.websiteUrl || null,
          depositAmount: parseFloat(form.depositAmount) || 50,
          allowFlash: form.allowFlash,
          allowCustom: form.allowCustom,
          portfolioImages,
          sizeOptions,
          customFields,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const addPortfolioImage = () => {
    if (newPortfolioUrl.trim()) {
      setPortfolioImages((prev) => [...prev, newPortfolioUrl.trim()]);
      setNewPortfolioUrl("");
    }
  };

  const addSizeOption = () => {
    if (newSize.label.trim()) {
      setSizeOptions((prev) => [
        ...prev,
        {
          id: `new-${Date.now()}`,
          label: newSize.label.trim(),
          price: newSize.price ? parseFloat(newSize.price) : null,
          sortOrder: prev.length,
        },
      ]);
      setNewSize({ label: "", price: "" });
    }
  };

  const addCustomField = () => {
    setCustomFields((prev) => [
      ...prev,
      {
        id: `field-${Date.now()}`,
        label: "New question",
        type: "text",
        required: false,
      },
    ]);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Profile info */}
      <Section title="Profile" description="Your public-facing artist profile.">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="label">Artist / Studio name *</label>
            <input
              type="text"
              className="input-field"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Bio</label>
            <textarea
              rows={4}
              className="input-field resize-none"
              placeholder="Tell clients about your style, specialties, and experience…"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Location</label>
            <input
              type="text"
              className="input-field"
              placeholder="City, State"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Instagram handle</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500">@</span>
              <input
                type="text"
                className="input-field pl-7"
                placeholder="yourusername"
                value={form.instagramHandle}
                onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Website URL</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://yourwebsite.com"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
            />
          </div>
        </div>

        {/* Portfolio images */}
        <div className="mt-5">
          <label className="label">Portfolio images</label>
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              className="input-field flex-1"
              placeholder="Paste image URL…"
              value={newPortfolioUrl}
              onChange={(e) => setNewPortfolioUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPortfolioImage()}
            />
            <button onClick={addPortfolioImage} className="btn-secondary px-4">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {portfolioImages.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {portfolioImages.map((img, i) => (
                <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden bg-obsidian-800 group">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setPortfolioImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute inset-0 bg-obsidian-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Booking settings */}
      <Section title="Booking options" description="Control what types of appointments you accept.">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-obsidian-700 p-4">
            <div>
              <p className="font-semibold text-white">Flash tattoos</p>
              <p className="text-sm text-obsidian-400">Clients can book from your flash designs</p>
            </div>
            <Toggle
              enabled={form.allowFlash}
              onChange={(v) => setForm({ ...form, allowFlash: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-obsidian-700 p-4">
            <div>
              <p className="font-semibold text-white">Custom tattoos</p>
              <p className="text-sm text-obsidian-400">Clients can submit custom reference images</p>
            </div>
            <Toggle
              enabled={form.allowCustom}
              onChange={(v) => setForm({ ...form, allowCustom: v })}
            />
          </div>
        </div>
      </Section>

      {/* Deposit settings */}
      <Section title="Deposit" description="Amount collected from clients to hold the appointment.">
        <div className="max-w-xs">
          <label className="label">Deposit amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="1"
              className="input-field pl-7"
              value={form.depositAmount}
              onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
            />
          </div>
          <p className="mt-1.5 text-xs text-obsidian-500">
            This amount is charged via Stripe when a client submits a booking request.
          </p>
        </div>
      </Section>

      {/* Size options */}
      <Section
        title="Size options"
        description="Customize the size dropdown clients see when booking. Drag to reorder."
      >
        <div className="space-y-2">
          {sizeOptions.map((opt, i) => (
            <div
              key={opt.id}
              className="flex items-center gap-3 rounded-lg bg-obsidian-800 px-3 py-2.5"
            >
              <GripVertical className="h-4 w-4 text-obsidian-600 cursor-grab" />
              <input
                type="text"
                className="flex-1 bg-transparent text-sm text-white outline-none"
                value={opt.label}
                onChange={(e) =>
                  setSizeOptions((prev) =>
                    prev.map((s, j) => (j === i ? { ...s, label: e.target.value } : s))
                  )
                }
              />
              <div className="relative w-24">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-obsidian-500 text-xs">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-full bg-obsidian-900 rounded-lg pl-5 pr-2 py-1 text-xs text-obsidian-300 border border-obsidian-700 outline-none focus:border-ink-500"
                  placeholder="price"
                  value={opt.price ?? ""}
                  onChange={(e) =>
                    setSizeOptions((prev) =>
                      prev.map((s, j) =>
                        j === i ? { ...s, price: e.target.value ? parseFloat(e.target.value) : null } : s
                      )
                    )
                  }
                />
              </div>
              <button
                onClick={() => setSizeOptions((prev) => prev.filter((_, j) => j !== i))}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-obsidian-500 hover:text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            className="input-field flex-1 text-sm"
            placeholder="Size label (e.g. Small 1–2 inches)"
            value={newSize.label}
            onChange={(e) => setNewSize({ ...newSize, label: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && addSizeOption()}
          />
          <div className="relative w-28">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="1"
              className="input-field pl-7"
              placeholder="price"
              value={newSize.price}
              onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
            />
          </div>
          <button onClick={addSizeOption} className="btn-secondary px-4 gap-1.5">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </Section>

      {/* Custom form fields */}
      <Section
        title="Additional form questions"
        description="Add custom questions to your booking form. Shown to clients after they select type, size, and placement."
      >
        <div className="space-y-3">
          {customFields.map((field, i) => (
            <div key={field.id} className="rounded-xl border border-obsidian-700 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Question label</label>
                      <input
                        type="text"
                        className="input-field text-sm"
                        value={field.label}
                        onChange={(e) =>
                          setCustomFields((prev) =>
                            prev.map((f, j) => (j === i ? { ...f, label: e.target.value } : f))
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Field type</label>
                      <select
                        className="input-field text-sm"
                        value={field.type}
                        onChange={(e) =>
                          setCustomFields((prev) =>
                            prev.map((f, j) =>
                              j === i ? { ...f, type: e.target.value as CustomField["type"] } : f
                            )
                          )
                        }
                      >
                        <option value="text">Short text</option>
                        <option value="textarea">Long text</option>
                        <option value="select">Dropdown</option>
                      </select>
                    </div>
                  </div>

                  {field.type === "select" && (
                    <div>
                      <label className="label text-xs">Options (comma-separated)</label>
                      <input
                        type="text"
                        className="input-field text-sm"
                        placeholder="Option 1, Option 2, Option 3"
                        value={field.options?.join(", ") ?? ""}
                        onChange={(e) =>
                          setCustomFields((prev) =>
                            prev.map((f, j) =>
                              j === i
                                ? {
                                    ...f,
                                    options: e.target.value.split(",").map((o) => o.trim()),
                                  }
                                : f
                            )
                          )
                        }
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={field.required}
                      onChange={(e) =>
                        setCustomFields((prev) =>
                          prev.map((f, j) => (j === i ? { ...f, required: e.target.checked } : f))
                        )
                      }
                    />
                    <span className="text-sm text-obsidian-300">Required field</span>
                  </label>
                </div>
                <button
                  onClick={() => setCustomFields((prev) => prev.filter((_, j) => j !== i))}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-obsidian-500 hover:text-red-400 hover:bg-red-900/20 flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addCustomField} className="btn-secondary gap-2 mt-3">
          <Plus className="h-4 w-4" />
          Add question
        </button>
      </Section>

      {/* Save button */}
      <div className="flex items-center gap-4 pt-4 border-t border-obsidian-800">
        <button onClick={save} disabled={saving} className="btn-primary gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save all changes"}
        </button>
        {status === "success" && (
          <div className="flex items-center gap-1.5 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" />
            Saved successfully
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-1.5 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            Failed to save. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-sm text-obsidian-400 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-ink-600" : "bg-obsidian-700"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
