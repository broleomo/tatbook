"use client";

import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, ImagePlus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const SIZES = [
  { value: "xs", label: "Extra Small", range: "1–2 inches" },
  { value: "sm", label: "Small", range: "2–4 inches" },
  { value: "md", label: "Medium", range: "4–6 inches" },
];

interface FlashDesign {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string;
  available: boolean;
  basePrice?: number | null;
  maxPrice?: number | null;
  sizes: string[];
  sortOrder: number;
}

interface Props {
  designs: FlashDesign[];
  artistId: string;
}

interface DesignForm {
  name: string;
  description: string;
  imageUrl: string;
  available: boolean;
  minPrice: string;
  maxPrice: string;
  sizes: string[];
}

const EMPTY_FORM: DesignForm = {
  name: "",
  description: "",
  imageUrl: "",
  available: true,
  minPrice: "",
  maxPrice: "",
  sizes: [],
};

const MAX_FILE_SIZE_MB = 10;

function formatPriceRange(min?: number | null, max?: number | null) {
  if (min && max) return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  if (min) return `From ${formatCurrency(min)}`;
  if (max) return `Up to ${formatCurrency(max)}`;
  return null;
}

export default function FlashDesignManager({ designs: initial, artistId }: Props) {
  const [designs, setDesigns] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DesignForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    resetImageState();
    setError("");
    setShowForm(true);
  };

  const openEdit = (design: FlashDesign) => {
    setEditingId(design.id);
    setForm({
      name: design.name,
      description: design.description ?? "",
      imageUrl: design.imageUrl,
      available: design.available,
      minPrice: design.basePrice?.toString() ?? "",
      maxPrice: design.maxPrice?.toString() ?? "",
      sizes: design.sizes ?? [],
    });
    resetImageState();
    setError("");
    setShowForm(true);
  };

  const toggleSize = (value: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(value)
        ? prev.sizes.filter((s) => s !== value)
        : [...prev.sizes, value],
    }));
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveDesign = async () => {
    if (!form.name.trim()) { setError("Design name is required."); return; }

    const hasExistingImage = !!form.imageUrl;
    const hasNewImage = !!imageFile;
    if (!hasExistingImage && !hasNewImage) {
      setError("Please upload an image for this design.");
      return;
    }

    const minPrice = form.minPrice ? parseFloat(form.minPrice) : null;
    const maxPrice = form.maxPrice ? parseFloat(form.maxPrice) : null;
    if (form.minPrice && (isNaN(minPrice!) || minPrice! <= 0)) {
      setError("Starting price must be a positive number.");
      return;
    }
    if (form.maxPrice && (isNaN(maxPrice!) || maxPrice! <= 0)) {
      setError("Maximum price must be a positive number.");
      return;
    }
    if (minPrice && maxPrice && maxPrice < minPrice) {
      setError("Maximum price must be greater than or equal to the starting price.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      let finalImageUrl = form.imageUrl;

      if (hasNewImage && imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("files", imageFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        setUploading(false);
        if (!upRes.ok) {
          const upData = await upRes.json().catch(() => ({}));
          throw new Error(upData.error ?? "Image upload failed. Please try a different image or check your connection.");
        }
        const { urls } = await upRes.json();
        if (!urls?.[0]) throw new Error("Image upload did not return a URL. Please try again.");
        finalImageUrl = urls[0];
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        imageUrl: finalImageUrl,
        available: form.available,
        basePrice: minPrice,
        maxPrice: maxPrice,
        sizes: form.sizes,
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/flash/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/flash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, artistId }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Failed to ${editingId ? "update" : "save"} design. Please try again.`);
      }

      const result = await res.json();
      if (editingId) {
        setDesigns((prev) => prev.map((d) => (d.id === editingId ? result : d)));
      } else {
        setDesigns((prev) => [...prev, result]);
      }
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const deleteDesign = async (id: string) => {
    if (!confirm("Delete this flash design? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/flash/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete design. Please try again.");
        return;
      }
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("Failed to delete design. Please check your connection and try again.");
    } finally {
      setDeleting(null);
    }
  };

  const toggleAvailable = async (design: FlashDesign) => {
    const res = await fetch(`/api/flash/${design.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !design.available }),
    });
    if (res.ok) {
      setDesigns((prev) =>
        prev.map((d) => d.id === design.id ? { ...d, available: !d.available } : d)
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-obsidian-400">
          {designs.filter((d) => d.available).length} of {designs.length} designs available
        </p>
        <button onClick={openCreate} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Add flash design
        </button>
      </div>

      {error && !showForm && (
        <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Fixed header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-obsidian-800">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit design" : "Add flash design"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-obsidian-400 hover:text-white hover:bg-obsidian-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Design name */}
              <div>
                <label className="label">Design name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Black Rose, Koi Fish"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="label">Design image *</label>
                {(imagePreview || form.imageUrl) ? (
                  <div className="relative rounded-xl overflow-hidden bg-obsidian-800 h-48">
                    <img
                      src={imagePreview || form.imageUrl}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-obsidian-900/80 backdrop-blur-sm border border-obsidian-700 px-3 py-1.5 text-xs font-medium text-obsidian-200 hover:text-white hover:bg-obsidian-800 transition-all"
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      Replace image
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={resetImageState}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-obsidian-900/80 backdrop-blur-sm flex items-center justify-center text-obsidian-400 hover:text-white hover:bg-obsidian-800 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-obsidian-700 p-8 cursor-pointer transition-all hover:border-ink-600 hover:bg-ink-900/10 group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileChange(e.dataTransfer.files[0] ?? null);
                    }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-obsidian-800 flex items-center justify-center group-hover:bg-ink-900/40 transition-colors">
                      <Upload className="h-6 w-6 text-obsidian-400 group-hover:text-ink-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-obsidian-300 group-hover:text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-obsidian-500 mt-1">
                        PNG, JPG, WEBP up to {MAX_FILE_SIZE_MB}MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Brief description of the design…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Price range */}
              <div>
                <label className="label">Price range (optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-obsidian-500 mb-1 block">Starting from</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input-field pl-7"
                        placeholder="0.00"
                        value={form.minPrice}
                        onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-obsidian-500 mb-1 block">Up to</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input-field pl-7"
                        placeholder="0.00"
                        value={form.maxPrice}
                        onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Available sizes */}
              <div>
                <label className="label">Available sizes (optional)</label>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((size) => {
                    const selected = form.sizes.includes(size.value);
                    return (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => toggleSize(size.value)}
                        className={`flex flex-col items-center gap-0.5 rounded-xl border px-3 py-3 text-center transition-all ${
                          selected
                            ? "border-ink-500 bg-ink-900/30 text-white"
                            : "border-obsidian-700 bg-obsidian-900 text-obsidian-400 hover:border-obsidian-600 hover:text-obsidian-200"
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {size.label}
                        </span>
                        <span className={`text-xs ${selected ? "text-ink-300" : "text-obsidian-500"}`}>
                          {size.range}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="label">Availability</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, available: !form.available })}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    form.available
                      ? "border-green-700/50 bg-green-900/20 text-green-400"
                      : "border-obsidian-700 bg-obsidian-900 text-obsidian-400"
                  }`}
                >
                  {form.available ? "Available for booking" : "Unavailable"}
                </button>
              </div>
            </div>

            {/* Fixed footer */}
            <div className="flex gap-3 p-6 pt-4 border-t border-obsidian-800">
              <button
                onClick={saveDesign}
                disabled={saving || uploading}
                className="btn-primary flex-1"
              >
                {uploading ? "Uploading image…" : saving ? "Saving…" : editingId ? "Save changes" : "Add design"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Designs grid */}
      {designs.length === 0 ? (
        <div className="card p-16 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-obsidian-800 flex items-center justify-center">
            <Upload className="h-8 w-8 text-obsidian-500" />
          </div>
          <div>
            <p className="font-semibold text-white">No flash designs yet</p>
            <p className="text-sm text-obsidian-400 mt-1">
              Add your flash designs so clients can browse and book them.
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            Add your first design
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {designs.map((design) => {
            const priceRange = formatPriceRange(design.basePrice, design.maxPrice);
            return (
              <div
                key={design.id}
                className={`card overflow-hidden ${!design.available ? "opacity-60" : ""}`}
              >
                <div className="aspect-square bg-obsidian-800 overflow-hidden relative">
                  <img
                    src={design.imageUrl}
                    alt={design.name}
                    className="h-full w-full object-cover"
                  />
                  {!design.available && (
                    <div className="absolute inset-0 bg-obsidian-950/60 flex items-center justify-center">
                      <span className="text-xs font-semibold text-obsidian-300 bg-obsidian-900/80 px-2 py-1 rounded">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <div>
                    <p className="font-semibold text-white text-sm">{design.name}</p>
                    {priceRange && (
                      <p className="text-xs text-ink-400">{priceRange}</p>
                    )}
                    {design.sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {design.sizes.map((s) => {
                          const sizeLabel = SIZES.find((sz) => sz.value === s);
                          return (
                            <span
                              key={s}
                              className="text-xs bg-obsidian-800 text-obsidian-300 px-1.5 py-0.5 rounded"
                            >
                              {sizeLabel?.label ?? s}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(design)}
                      className="flex-1 btn-ghost text-xs py-1.5 px-2 gap-1 justify-center"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleAvailable(design)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-obsidian-400 hover:text-white hover:bg-obsidian-800 transition-all"
                      title={design.available ? "Hide design" : "Show design"}
                    >
                      {design.available ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteDesign(design.id)}
                      disabled={deleting === design.id}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-obsidian-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
