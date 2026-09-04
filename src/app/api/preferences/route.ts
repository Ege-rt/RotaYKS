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
  const preferences = database.data.preferences
    .filter((p) => p.userId === userId)
    .sort((a, b) => a.order - b.order);

  return NextResponse.json({ preferences });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { university, department, note } = await req.json();
  if (!university || !department) {
    return NextResponse.json({ error: "Üniversite ve bölüm gerekli." }, { status: 400 });
  }

  const database = await getDb();
  const siblings = database.data.preferences.filter((p) => p.userId === userId);
  const pref = {
    id: uuid(),
    userId,
    university,
    department,
    note: note || "",
    order: siblings.length,
    createdAt: new Date().toISOString(),
  };
  database.data.preferences.push(pref);
  await database.write();

  return NextResponse.json({ preference: pref });
}
