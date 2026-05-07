"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

const MAX_FILES = 3;
const MAX_SIZE_MB = 10;

export default function CustomBookingSection({ files, onChange }: Props) {
  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const valid = Array.from(incoming).filter((f) => {
        if (!f.type.startsWith("image/")) return false;
        if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
        return true;
      });
      const combined = [...files, ...valid].slice(0, MAX_FILES);
      onChange(combined);
    },
    [files, onChange]
  );

  const [fileUrls, setFileUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setFileUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-obsidian-300 font-medium mb-1">
          Reference images
          <span className="text-obsidian-500 font-normal ml-1">
            ({files.length}/{MAX_FILES} uploaded)
          </span>
        </p>
        <p className="text-xs text-obsidian-500 mb-3">
          Upload up to {MAX_FILES} images to help the artist understand your vision. Max {MAX_SIZE_MB}MB each.
        </p>

        {/* Upload dropzone */}
        {files.length < MAX_FILES && (
          <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-obsidian-700 p-8 cursor-pointer transition-all hover:border-ink-600 hover:bg-ink-900/10 group">
            <div className="h-12 w-12 rounded-xl bg-obsidian-800 flex items-center justify-center group-hover:bg-ink-900/40 transition-colors">
              <Upload className="h-6 w-6 text-obsidian-400 group-hover:text-ink-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-obsidian-300 group-hover:text-white">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-obsidian-500 mt-1">
                PNG, JPG, WEBP up to {MAX_SIZE_MB}MB
              </p>
            </div>
            <input
              type="file"
              className="sr-only"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}

        {/* Preview grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {files.map((file, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-obsidian-800">
                <img
                  src={fileUrls[i]}
                  alt={`Reference ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-obsidian-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="h-9 w-9 rounded-full bg-red-700/80 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center">
                  <p className="text-xs text-white/80 truncate bg-obsidian-950/60 rounded px-1 py-0.5">
                    {file.name}
                  </p>
                </div>
              </div>
            ))}

            {/* Add more slot */}
            {files.length < MAX_FILES && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-obsidian-700 flex flex-col items-center justify-center cursor-pointer hover:border-ink-600 hover:bg-ink-900/10 transition-all">
                <ImageIcon className="h-6 w-6 text-obsidian-500" />
                <span className="text-xs text-obsidian-500 mt-1">Add more</span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-obsidian-800/50 p-3">
        <AlertCircle className="h-4 w-4 text-obsidian-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-obsidian-400">
          Reference images help the artist understand your idea but don&apos;t need to be exact.
          Feel free to share mood boards, inspiration photos, or rough sketches.
        </p>
      </div>
    </div>
  );
}
