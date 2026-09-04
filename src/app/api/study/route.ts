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
  const entries = database.data.studyEntries.filter((e) => e.userId === userId);
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { date, hours } = await req.json();
  if (!date || typeof hours !== "number" || hours < 0 || hours > 24) {
    return NextResponse.json({ error: "Geçersiz tarih veya saat." }, { status: 400 });
  }

  const database = await getDb();
  const existing = database.data.studyEntries.find(
    (e) => e.userId === userId && e.date === date
  );

  if (existing) {
    if (hours === 0) {
      database.data.studyEntries = database.data.studyEntries.filter((e) => e !== existing);
    } else {
      existing.hours = hours;
    }
    await database.write();
    return NextResponse.json({ entry: hours === 0 ? null : existing });
  }

  if (hours === 0) {
    return NextResponse.json({ entry: null });
  }

  const entry = { id: uuid(), userId, date, hours };
  database.data.studyEntries.push(entry);
  await database.write();
  return NextResponse.json({ entry });
}
