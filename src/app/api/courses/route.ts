import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuid } from "uuid";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const database = await getDb();
  const courses = database.data.courses
    .filter((c) => c.userId === userId)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      ...c,
      videos: database.data.videos
        .filter((v) => v.courseId === c.id)
        .sort((a, b) => a.order - b.order),
    }));

  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { title } = await req.json();
  if (!title) return NextResponse.json({ error: "Başlık gerekli." }, { status: 400 });

  const database = await getDb();
  const siblings = database.data.courses.filter((c) => c.userId === userId);
  const course = {
    id: uuid(),
    userId,
    title,
    order: siblings.length,
    createdAt: new Date().toISOString(),
  };
  database.data.courses.push(course);
  await database.write();

  return NextResponse.json({ course: { ...course, videos: [] } });
}
