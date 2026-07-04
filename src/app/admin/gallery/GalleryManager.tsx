"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Item = {
  id: number;
  src: string;
  caption: string;
  width: number;
  height: number;
  position: number;
};

const MAX_BYTES = 15 * 1024 * 1024;

export default function GalleryManager({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [items, setItems] = useState<Item[]>(initialItems);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-item state
  const [captionDrafts, setCaptionDrafts] = useState<Record<number, string>>(
    {}
  );
  const [busyId, setBusyId] = useState<number | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onFileChosen(f: File | null) {
    setNotice(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNotice({
        kind: "error",
        text: "That photo is over 15MB. Please choose a smaller photo.",
      });
      return;
    }
    setFile(f);
    // HEIC previews don't render in most browsers; skip the thumbnail then.
    const isHeic = /\.hei[cf]$/i.test(f.name) || /hei[cf]/i.test(f.type);
    setPreviewUrl(isHeic ? null : URL.createObjectURL(f));
  }

  async function publish() {
    if (!file || uploading) return;
    setUploading(true);
    setNotice(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("caption", caption);
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({
          kind: "error",
          text: data.error ?? "Upload failed. Please try again.",
        });
        return;
      }
      const created: Item = data.item;
      setItems((prev) => [
        created,
        ...prev.map((it) => ({ ...it, position: it.position + 1 })),
      ]);
      // Reset the form
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNotice({
        kind: "success",
        text: "Published! It's now first in the gallery.",
      });
    } catch {
      setNotice({
        kind: "error",
        text: "Upload failed — check your connection and try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function saveCaption(id: number) {
    const draft = captionDrafts[id];
    if (draft === undefined || busyId !== null) return;
    setBusyId(id);
    setItemError(null);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setItemError(data.error ?? "Couldn't save the caption.");
        return;
      }
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, caption: data.item.caption } : it
        )
      );
      setCaptionDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      setItemError("Couldn't save the caption — check your connection.");
    } finally {
      setBusyId(null);
    }
  }

  async function moveToTop(id: number) {
    if (busyId !== null) return;
    setBusyId(id);
    setItemError(null);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moveToTop" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setItemError(data.error ?? "Couldn't move that photo.");
        return;
      }
      setItems((prev) => {
        const target = prev.find((it) => it.id === id);
        if (!target) return prev;
        const rest = prev.filter((it) => it.id !== id);
        return [{ ...target, position: 1 }, ...rest].map((it, i) => ({
          ...it,
          position: i + 1,
        }));
      });
    } catch {
      setItemError("Couldn't move that photo — check your connection.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    if (busyId !== null) return;
    if (!window.confirm("Delete this photo from the gallery? This can't be undone.")) {
      return;
    }
    setBusyId(id);
    setItemError(null);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setItemError(data.error ?? "Couldn't delete that photo.");
        return;
      }
      setItems((prev) =>
        prev
          .filter((it) => it.id !== id)
          .map((it, i) => ({ ...it, position: i + 1 }))
      );
    } catch {
      setItemError("Couldn't delete that photo — check your connection.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {/* Upload card */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl text-dark">Add a Photo</h2>

        <label className="mt-5 flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-sage/60 bg-light/60 p-6 text-center transition-colors hover:border-sage active:bg-light">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
          />
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Preview of the chosen photo"
              className="max-h-64 w-auto rounded-xl object-contain"
            />
          ) : (
            <>
              <span className="text-4xl text-sage" aria-hidden="true">
                +
              </span>
              <span className="text-lg font-medium text-dark">
                {file ? file.name : "Tap to add a photo"}
              </span>
              <span className="text-sm font-light text-gray">
                {file
                  ? "Preview not available — ready to publish."
                  : "Take a photo or choose one from your library (up to 15MB)."}
              </span>
            </>
          )}
          {previewUrl && (
            <span className="text-sm font-light text-gray">
              Tap to choose a different photo
            </span>
          )}
        </label>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-dark">
            Caption <span className="font-light text-gray">(optional)</span>
          </span>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Wild salmon with citrus fennel salad"
            className="mt-2 w-full rounded-xl border border-light-2 bg-white px-4 py-4 text-lg font-light text-dark placeholder:text-gray/60 focus:border-sage focus:outline-none"
          />
        </label>

        <button
          type="button"
          onClick={publish}
          disabled={!file || uploading}
          className="mt-5 w-full rounded-xl bg-sage py-4 text-lg font-medium text-white transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Publishing…" : "Publish to Gallery"}
        </button>

        {notice && (
          <p
            role="status"
            className={`mt-4 rounded-xl px-4 py-3 text-center text-base ${
              notice.kind === "success"
                ? "bg-sage/15 text-olive-dark"
                : "bg-red-50 text-red-700"
            }`}
          >
            {notice.text}
          </p>
        )}
      </div>

      {/* Current gallery */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl text-dark">
          Current Gallery{" "}
          <span className="text-base font-light text-gray">
            ({items.length} photo{items.length === 1 ? "" : "s"})
          </span>
        </h2>

        {itemError && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-base text-red-700"
          >
            {itemError}
          </p>
        )}

        {items.length === 0 ? (
          <p className="mt-6 text-sm font-light text-gray">
            No photos yet — add one above.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const draft = captionDrafts[item.id];
              const dirty = draft !== undefined && draft !== item.caption;
              const busy = busyId === item.id;
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-light-2 bg-light/40"
                >
                  <div className="relative aspect-[4/3] bg-light">
                    <Image
                      src={item.src}
                      alt={item.caption || `Gallery photo ${item.position}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-dark/70 px-2.5 py-1 text-xs font-medium text-white">
                      #{item.position}
                    </span>
                  </div>
                  <div className="p-4">
                    <input
                      type="text"
                      value={draft ?? item.caption}
                      onChange={(e) =>
                        setCaptionDrafts((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      placeholder="Add a caption…"
                      className="w-full rounded-lg border border-light-2 bg-white px-3 py-3 text-base font-light text-dark placeholder:text-gray/60 focus:border-sage focus:outline-none"
                    />
                    {dirty && (
                      <button
                        type="button"
                        onClick={() => saveCaption(item.id)}
                        disabled={busy}
                        className="mt-2 w-full rounded-lg bg-olive py-3 text-base font-medium text-white transition-colors hover:bg-olive-dark disabled:opacity-50"
                      >
                        {busy ? "Saving…" : "Save Caption"}
                      </button>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveToTop(item.id)}
                        disabled={busy || item.position === 1}
                        className="flex-1 rounded-lg bg-sage/15 py-3 text-sm font-medium text-olive-dark transition-colors hover:bg-sage/25 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ↑ Move to top
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        disabled={busy}
                        className="flex-1 rounded-lg bg-red-50 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
