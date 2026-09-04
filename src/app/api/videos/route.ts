import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuid } from "uuid";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { courseId, title, url } = await req.json();
  if (!courseId || !title) return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });

  const database = await getDb();
  const course = database.data.courses.find((c) => c.id === courseId && c.userId === userId);
  if (!course) return NextResponse.json({ error: "Playlist bulunamadı." }, { status: 404 });

  const siblings = database.data.videos.filter((v) => v.courseId === courseId);
  const video = {
    id: uuid(),
    courseId,
    title,
    url: url || "",
    watched: false,
    order: siblings.length,
  };
  database.data.videos.push(video);
  await database.write();

  return NextResponse.json({ video });
}
