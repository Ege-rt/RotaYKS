import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const database = await getDb();
  const idx = database.data.exams.findIndex((e) => e.id === params.id && e.userId === userId);
  if (idx === -1) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  database.data.exams.splice(idx, 1);
  await database.write();
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await req.json();
  const database = await getDb();
  const exam = database.data.exams.find((e) => e.id === params.id && e.userId === userId);
  if (!exam) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  if (body.name !== undefined) exam.name = body.name;
  if (body.publisher !== undefined) exam.publisher = body.publisher;
  if (body.date !== undefined) exam.date = body.date;
  if (body.subjectNets !== undefined) {
    exam.subjectNets = body.subjectNets;
    exam.totalNet =
      Math.round(
        Object.values(body.subjectNets as Record<string, number>).reduce(
          (sum: number, n) => sum + (Number.isFinite(n) ? (n as number) : 0),
          0
        ) * 100
      ) / 100;
  }

  await database.write();
  return NextResponse.json({ exam });
}
