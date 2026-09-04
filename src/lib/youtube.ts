// Farklı YouTube link biçimlerinden video ID'sini çıkarır:
// watch?v=, youtu.be/, embed/, shorts/ ve çıplak ID girişini destekler.
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (id) return id;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const vParam = url.searchParams.get("v");
      if (vParam) return vParam;

      const segments = url.pathname.split("/").filter(Boolean);
      const embedIdx = segments.indexOf("embed");
      if (embedIdx !== -1 && segments[embedIdx + 1]) return segments[embedIdx + 1];

      const shortsIdx = segments.indexOf("shorts");
      if (shortsIdx !== -1 && segments[shortsIdx + 1]) return segments[shortsIdx + 1];
    }
  } catch {
    // Not a full URL — fall through to bare-ID check below.
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}
