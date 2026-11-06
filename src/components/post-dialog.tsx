"use client";
import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { PlatformIcon } from "@/components/badges";
import { useStore } from "@/lib/store";
import { dayKey, platformLabels, statusLabels, timeKey, toIsoRo } from "@/lib/format";
import type { Post, PostStatus, Project } from "@/lib/types";

const editableStatuses: PostStatus[] = ["idea", "draft", "pending_approval", "approved", "scheduled", "published"];

/** Fereastra de editare a unei postări: text, status, dată, ștergere. */
export function PostDialog({ post, project, onClose }: { post: Post; project: Project; onClose: () => void }) {
  const { dispatch } = useStore();
  const [title, setTitle] = useState(post.title);
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [day, setDay] = useState(post.scheduledAt ? dayKey(post.scheduledAt) : "");
  const [time, setTime] = useState(post.scheduledAt ? timeKey(post.scheduledAt) : "10:00");
  const [variants, setVariants] = useState(post.variants);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const needsDate = status === "scheduled" || status === "published";

  function save() {
    dispatch({
      type: "updatePost",
      id: post.id,
      patch: { title: title.trim() || post.title, status, variants, scheduledAt: day ? toIsoRo(day, time) : undefined },
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label="Editează postarea" className="card max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-b-none p-5 sm:rounded-xl">
        <div className="mb-4 flex items-start gap-3">
          <input
            aria-label="Titlu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
          />
          <button onClick={onClose} aria-label="Închide" className="text-muted hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[180px_1fr]">
          <div>
            {post.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.imageUrl} alt={post.title} className="aspect-square w-full rounded-lg object-cover" />
            ) : (
              <AssetPreview brand={project.brand} kind={post.assetKind} title={title} />
            )}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium">Status</span>
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}>
                  {editableStatuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Ziua</span>
                <input type="date" className="input" value={day} onChange={(e) => setDay(e.target.value)} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Ora</span>
                <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
            </div>
            {needsDate && !day && <p className="text-xs text-amber-700 dark:text-amber-400">Alege ziua ca să apară în calendar.</p>}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {variants.map((v, i) => (
            <label key={v.platform} className="block text-sm">
              <span className="mb-1 flex items-center gap-2 font-medium">
                <PlatformIcon platform={v.platform} size="sm" /> {platformLabels[v.platform]}
              </span>
              <textarea
                rows={4}
                className="input resize-y"
                value={v.hashtags.length ? `${v.caption}\n\n${v.hashtags.join(" ")}` : v.caption}
                onChange={(e) =>
                  setVariants(variants.map((x, j) => (j === i ? { ...x, caption: e.target.value, hashtags: [] } : x)))
                }
              />
            </label>
          ))}
        </div>

        {post.metrics && (
          <p className="mt-4 text-xs text-muted">
            Rezultate: {post.metrics.reach} oameni atinși, {post.metrics.likes} aprecieri, {post.metrics.comments} comentarii.
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-sm">
              Sigur ștergi?
              <button
                onClick={() => {
                  dispatch({ type: "deletePost", id: post.id });
                  onClose();
                }}
                className="btn-ghost border-red-300 px-2.5 py-1 text-red-600"
              >
                Da, șterge
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost px-2.5 py-1">
                Nu
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="btn-ghost text-red-600">
              <Trash2 size={16} /> Șterge
            </button>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <button onClick={onClose} className="btn-ghost flex-1 sm:flex-none">
              Renunță
            </button>
            <button onClick={save} className="btn-primary flex-1 sm:flex-none">
              Salvează
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
