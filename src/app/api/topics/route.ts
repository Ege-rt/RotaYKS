import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuid } from "uuid";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(req.url);
  const examType = searchParams.get("examType");

  const database = await getDb();
  let topics = database.data.topics.filter((t) => t.userId === userId);
  if (examType) topics = topics.filter((t) => t.examType === examType);
  topics = topics.sort((a, b) => a.order - b.order);

  return NextResponse.json({ topics });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { examType, subject, topic } = await req.json();
  if (!examType || !subject || !topic) {
    return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
  }

  const database = await getDb();
  const siblings = database.data.topics.filter(
    (t) => t.userId === userId && t.examType === examType && t.subject === subject
  );
  const newTopic = {
    id: uuid(),
    userId,
    examType,
    subject,
    topic,
    explanation: false,
    test: false,
    status: "Başlanmadı" as const,
    order: siblings.length,
  };
  database.data.topics.push(newTopic);
  await database.write();

  return NextResponse.json({ topic: newTopic });
}
