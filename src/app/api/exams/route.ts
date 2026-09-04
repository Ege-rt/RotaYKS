import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuid } from "uuid";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const database = await getDb();
  const userId = (session.user as { id: string }).id;
  const exams = database.data.exams
    .filter((e) => e.userId === userId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return NextResponse.json({ exams });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await req.json();
  const { name, type, track, publisher, date, subjectNets } = body as {
    name: string;
    type: "TYT" | "AYT";
    track?: string;
    publisher?: string;
    date: string;
    subjectNets: Record<string, number>;
  };

  if (!name || !type || !date || !subjectNets) {
    return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
  }

  const totalNet = Object.values(subjectNets).reduce(
    (sum, n) => sum + (Number.isFinite(n) ? n : 0),
    0
  );

  const database = await getDb();
  const exam = {
    id: uuid(),
    userId,
    name,
    type,
    track: type === "AYT" ? track : undefined,
    publisher: publisher || "",
    date,
    subjectNets,
    totalNet: Math.round(totalNet * 100) / 100,
    createdAt: new Date().toISOString(),
  };
  database.data.exams.push(exam);
  await database.write();

  return NextResponse.json({ exam });
}
