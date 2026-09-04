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
  const topic = database.data.topics.find((t) => t.id === params.id && t.userId === userId);
  if (!topic) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  if (body.explanation !== undefined) topic.explanation = body.explanation;
  if (body.test !== undefined) topic.test = body.test;
  if (body.status !== undefined) topic.status = body.status;

  await database.write();
  return NextResponse.json({ topic });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const database = await getDb();
  const idx = database.data.topics.findIndex((t) => t.id === params.id && t.userId === userId);
  if (idx === -1) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  database.data.topics.splice(idx, 1);
  await database.write();
  return NextResponse.json({ ok: true });
}
