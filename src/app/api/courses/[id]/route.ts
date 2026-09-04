import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const database = await getDb();
  const idx = database.data.courses.findIndex((c) => c.id === params.id && c.userId === userId);
  if (idx === -1) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  database.data.courses.splice(idx, 1);
  database.data.videos = database.data.videos.filter((v) => v.courseId !== params.id);
  await database.write();

  return NextResponse.json({ ok: true });
}
