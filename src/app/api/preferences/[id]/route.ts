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
  const pref = database.data.preferences.find((p) => p.id === params.id && p.userId === userId);
  if (!pref) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  if (body.note !== undefined) pref.note = body.note;
  if (body.order !== undefined) pref.order = body.order;
  if (body.university !== undefined) pref.university = body.university;
  if (body.department !== undefined) pref.department = body.department;

  await database.write();
  return NextResponse.json({ preference: pref });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const database = await getDb();
  const idx = database.data.preferences.findIndex(
    (p) => p.id === params.id && p.userId === userId
  );
  if (idx === -1) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  database.data.preferences.splice(idx, 1);
  // reorder remaining
  const remaining = database.data.preferences
    .filter((p) => p.userId === userId)
    .sort((a, b) => a.order - b.order);
  remaining.forEach((p, i) => (p.order = i));

  await database.write();
  return NextResponse.json({ ok: true });
}
