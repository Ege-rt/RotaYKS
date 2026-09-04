import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuid } from "uuid";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const listParam = url.searchParams.get("list");
    if (listParam) return listParam;
  } catch {
    // not a full URL — fall through
  }
  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;
  return null;
}

type YTThumb = { url: string };
type YTPlaylistItem = {
  snippet: {
    title: string;
    position: number;
    thumbnails?: { medium?: YTThumb; high?: YTThumb; default?: YTThumb };
    resourceId: { videoId: string };
  };
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Bir YouTube playlist linki gir." }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "YouTube playlist içe aktarma için YOUTUBE_API_KEY tanımlı değil. .env.local dosyana Google Cloud Console'dan aldığın bir YouTube Data API v3 anahtarını ekleyip sunucuyu yeniden başlat.",
      },
      { status: 400 }
    );
  }

  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    return NextResponse.json({ error: "Geçerli bir YouTube playlist linki değil." }, { status: 400 });
  }

  try {
    // 1) Playlist başlığı ve kapak fotoğrafı
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
    );
    const playlistData = await playlistRes.json();

    if (!playlistRes.ok) {
      const message = playlistData?.error?.message || "YouTube API isteği başarısız oldu.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (!playlistData.items || playlistData.items.length === 0) {
      return NextResponse.json(
        { error: "Playlist bulunamadı. Linkin herkese açık olduğundan emin ol." },
        { status: 404 }
      );
    }

    const playlistSnippet = playlistData.items[0].snippet;
    const playlistTitle: string = playlistSnippet.title || "İçe Aktarılan Playlist";
    const playlistThumb: string | undefined =
      playlistSnippet.thumbnails?.high?.url ||
      playlistSnippet.thumbnails?.medium?.url ||
      playlistSnippet.thumbnails?.default?.url;

    // 2) Tüm videoları sayfalayarak çek (en fazla 300 video ile sınırlı)
    const items: YTPlaylistItem[] = [];
    let pageToken = "";
    let guard = 0;

    do {
      const itemsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}${
          pageToken ? `&pageToken=${pageToken}` : ""
        }&key=${apiKey}`
      );
      const itemsData = await itemsRes.json();

      if (!itemsRes.ok) {
        const message = itemsData?.error?.message || "Video listesi alınamadı.";
        return NextResponse.json({ error: message }, { status: 400 });
      }

      items.push(...(itemsData.items || []));
      pageToken = itemsData.nextPageToken || "";
      guard++;
    } while (pageToken && guard < 6);

    const videos = items
      .filter(
        (it) =>
          it.snippet?.title &&
          it.snippet.title !== "Private video" &&
          it.snippet.title !== "Deleted video"
      )
      .sort((a, b) => a.snippet.position - b.snippet.position)
      .map((it, idx) => ({
        id: uuid(),
        title: it.snippet.title,
        url: `https://www.youtube.com/watch?v=${it.snippet.resourceId.videoId}`,
        thumbnail:
          it.snippet.thumbnails?.medium?.url ||
          it.snippet.thumbnails?.high?.url ||
          it.snippet.thumbnails?.default?.url ||
          "",
        watched: false,
        order: idx,
      }));

    if (videos.length === 0) {
      return NextResponse.json(
        { error: "Playlist'te içe aktarılabilir video bulunamadı." },
        { status: 404 }
      );
    }

    const database = await getDb();
    const siblings = database.data.courses.filter((c) => c.userId === userId);
    const courseId = uuid();
    const course = {
      id: courseId,
      userId,
      title: playlistTitle,
      coverImage: playlistThumb,
      sourceUrl: url,
      order: siblings.length,
      createdAt: new Date().toISOString(),
    };

    database.data.courses.push(course);
    for (const v of videos) {
      database.data.videos.push({ ...v, courseId });
    }
    await database.write();

    return NextResponse.json({ course: { ...course, videos } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Playlist içe aktarılırken bir hata oluştu. Linki kontrol edip tekrar dene." },
      { status: 500 }
    );
  }
}
