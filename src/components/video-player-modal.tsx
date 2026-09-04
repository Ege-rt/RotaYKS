"use client";

import { useEffect } from "react";
import { X, Maximize2 } from "lucide-react";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { Portal } from "./portal";

export function VideoPlayerModal({
  video,
  onClose,
}: {
  video: { title: string; url: string } | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!video) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [video, onClose]);

  if (!video) return null;

  const videoId = extractYouTubeVideoId(video.url);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl animate-fade-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="line-clamp-1 text-sm font-medium text-white">{video.title}</p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden items-center gap-1 text-[11px] text-mist-300 sm:flex">
                <Maximize2 className="h-3 w-3" /> Tam ekran için oynatıcıdaki simgeye tıkla
              </span>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-black shadow-glow">
            {videoId ? (
              <div className="aspect-video w-full">
                <iframe
                  key={videoId}
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 p-8 text-center">
                <p className="text-sm text-mist-300">
                  Bu video için geçerli bir YouTube linki bulunamadı.
                </p>
                {video.url && (
                  <a href={video.url} target="_blank" rel="noreferrer" className="btn-secondary">
                    Linki Yeni Sekmede Aç
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
