"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Check,
  ChevronDown,
  PlayCircle,
  ExternalLink,
  Clapperboard,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { Portal } from "@/components/portal";
import type { Course, VideoItem } from "@/lib/db";

type CourseWithVideos = Course & { videos: VideoItem[] };

function ImportModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: (course: CourseWithVideos) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/courses/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Bir şeyler ters gitti.");
      return;
    }
    onImported(data.course);
    setUrl("");
    onClose();
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="glass-panel w-full max-w-lg p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-violet-300" />
              <h3 className="font-display text-lg font-semibold text-white">
                Playlist İçe Aktar
              </h3>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-mist-500 hover:bg-[var(--hover-tint)]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-4 text-[13px] text-mist-500">
            YouTube playlist linkini yapıştır — tüm bölümler kapak fotoğraflarıyla otomatik eklensin.
          </p>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=..."
              className="glass-input"
            />
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-bad/20 bg-bad/10 px-3.5 py-3 text-[12.5px] leading-relaxed text-bad">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clapperboard className="h-4 w-4" />}
              {loading ? "İçe aktarılıyor..." : "İçe Aktar"}
            </button>
          </form>
        </div>
      </div>
    </Portal>
  );
}

export default function VideosPage() {
  const [courses, setCourses] = useState<CourseWithVideos[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [videoDrafts, setVideoDrafts] = useState<Record<string, { title: string; url: string }>>({});
  const [importOpen, setImportOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => {
        setCourses(d.courses || []);
        setLoading(false);
        if (d.courses?.[0]) setOpenId(d.courses[0].id);
      });
  }, []);

  async function addCourse(e: FormEvent) {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newCourseTitle }),
    });
    const data = await res.json();
    if (res.ok) {
      setCourses((prev) => [...prev, data.course]);
      setNewCourseTitle("");
      setOpenId(data.course.id);
    }
  }

  function onImported(course: CourseWithVideos) {
    setCourses((prev) => [...prev, course]);
    setOpenId(course.id);
  }

  async function deleteCourse(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
  }

  async function addVideo(courseId: string, e: FormEvent) {
    e.preventDefault();
    const draft = videoDrafts[courseId];
    if (!draft?.title?.trim()) return;
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, title: draft.title, url: draft.url }),
    });
    const data = await res.json();
    if (res.ok) {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, videos: [...c.videos, data.video] } : c))
      );
      setVideoDrafts((p) => ({ ...p, [courseId]: { title: "", url: "" } }));
    }
  }

  async function toggleVideo(courseId: string, videoId: string, watched: boolean) {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, videos: c.videos.map((v) => (v.id === videoId ? { ...v, watched } : v)) }
          : c
      )
    );
    await fetch(`/api/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched }),
    });
  }

  async function deleteVideo(courseId: string, videoId: string) {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, videos: c.videos.filter((v) => v.id !== videoId) } : c
      )
    );
    await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Ders Playlist"
        title="YouTube playlist takibi"
        description="Bir link yapıştır, tüm bölümler kapak fotoğraflarıyla otomatik eklensin."
        action={
          <button onClick={() => setImportOpen(true)} className="btn-primary">
            <Clapperboard className="h-4 w-4" /> Playlist İçe Aktar
          </button>
        }
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={onImported}
      />

      <VideoPlayerModal video={playingVideo} onClose={() => setPlayingVideo(null)} />

      <form onSubmit={addCourse} className="mb-6 flex gap-2">
        <input
          value={newCourseTitle}
          onChange={(e) => setNewCourseTitle(e.target.value)}
          placeholder="veya elle bir playlist adı ekle..."
          className="glass-input max-w-xs"
        />
        <button type="submit" className="btn-secondary">
          <Plus className="h-4 w-4" /> Ekle
        </button>
      </form>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-panel h-16 animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-panel flex flex-col items-center gap-2 p-16 text-center">
          <PlayCircle className="h-8 w-8 text-mist-700" />
          <p className="text-sm text-mist-500">Henüz playlist eklenmedi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const total = course.videos.length;
            const done = course.videos.filter((v) => v.watched).length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            const isOpen = openId === course.id;

            return (
              <div key={course.id} className="glass-panel overflow-hidden p-0">
                <button
                  onClick={() => setOpenId(isOpen ? null : course.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-mist-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                    {course.coverImage ? (
                      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-line">
                        <Image
                          src={course.coverImage}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
                        <PlayCircle className="h-5 w-5 text-violet-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold text-white">
                        {course.title}
                      </p>
                      <p className="text-xs text-mist-700">
                        {done}/{total} bölüm izlendi
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="hidden w-32 items-center gap-2 sm:flex">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--hover-tint)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="stat-number w-9 text-right text-xs text-mist-500">{pct}%</span>
                    </div>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCourse(course.id);
                      }}
                      className="rounded-lg p-1.5 text-mist-700 hover:bg-bad/10 hover:text-bad"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-line p-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {course.videos.map((v) => (
                        <div
                          key={v.id}
                          className={`group relative overflow-hidden rounded-2xl border transition-colors ${
                            v.watched
                              ? "border-violet-400/30 bg-violet-500/5"
                              : "border-line bg-ink-900/40 hover:border-violet-400/20"
                          }`}
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-ink-950">
                            <button
                              onClick={() => setPlayingVideo(v)}
                              className="absolute inset-0 h-full w-full"
                            >
                              {v.thumbnail ? (
                                <Image
                                  src={v.thumbnail}
                                  alt={v.title}
                                  fill
                                  sizes="220px"
                                  className={`object-cover transition-opacity ${
                                    v.watched ? "opacity-40" : "opacity-100"
                                  }`}
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <PlayCircle className="h-6 w-6 text-mist-700" />
                                </div>
                              )}
                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
                                  <PlayCircle className="h-6 w-6 text-ink-950" />
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => toggleVideo(course.id, v.id, !v.watched)}
                              className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 backdrop-blur ${
                                v.watched
                                  ? "border-violet-400 bg-violet-500"
                                  : "border-white/40 bg-black/30 hover:border-violet-300"
                              }`}
                            >
                              {v.watched && <Check className="h-3.5 w-3.5 text-white" />}
                            </button>
                          </div>
                          <div className="flex items-start gap-1.5 p-2.5">
                            <p
                              className={`line-clamp-2 flex-1 text-[12px] leading-snug ${
                                v.watched ? "text-mist-700 line-through" : "text-mist-100"
                              }`}
                            >
                              {v.title}
                            </p>
                            <div className="flex shrink-0 flex-col gap-1">
                              {v.url && (
                                <a
                                  href={v.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-mist-700 hover:text-violet-300"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              <button
                                onClick={() => deleteVideo(course.id, v.id)}
                                className="text-mist-700 hover:text-bad"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => addVideo(course.id, e)}
                      className="mt-4 flex gap-2"
                    >
                      <input
                        value={videoDrafts[course.id]?.title || ""}
                        onChange={(e) =>
                          setVideoDrafts((p) => ({
                            ...p,
                            [course.id]: { ...p[course.id], title: e.target.value, url: p[course.id]?.url || "" },
                          }))
                        }
                        placeholder="Bölüm adı (Örn: 5. Bölüm - Üslü Sayılar)"
                        className="glass-input flex-1"
                      />
                      <input
                        value={videoDrafts[course.id]?.url || ""}
                        onChange={(e) =>
                          setVideoDrafts((p) => ({
                            ...p,
                            [course.id]: { ...p[course.id], url: e.target.value, title: p[course.id]?.title || "" },
                          }))
                        }
                        placeholder="YouTube linki"
                        className="glass-input w-56"
                      />
                      <button type="submit" className="btn-secondary shrink-0">
                        <Plus className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
