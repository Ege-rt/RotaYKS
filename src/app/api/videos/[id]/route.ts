import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await req.json();
  const database = await getDb();
  const video = database.data.videos.find((v) => v.id === params.id);
  if (!video) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  const course = database.data.courses.find((c) => c.id === video.courseId && c.userId === userId);
  if (!course) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  if (body.watched !== undefined) video.watched = body.watched;
  if (body.title !== undefined) video.title = body.title;
  if (body.url !== undefined) video.url = body.url;

  await database.write();
  return NextResponse.json({ video });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const database = await getDb();
  const idx = database.data.videos.findIndex((v) => v.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  const course = database.data.courses.find(
    (c) => c.id === database.data.videos[idx].courseId && c.userId === userId
  );
  if (!course) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  database.data.videos.splice(idx, 1);
  await database.write();

  return NextResponse.json({ ok: true });
}
