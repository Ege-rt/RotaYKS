import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ESTIMATED_TYT_DATE, ESTIMATED_AYT_DATE } from "@/lib/exam-rules";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const database = await getDb();
  const user = database.data.users.find((u) => u.id === userId);
  if (!user) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  return NextResponse.json({
    tytDate: user.tytDate || ESTIMATED_TYT_DATE,
    aytDate: user.aytDate || ESTIMATED_AYT_DATE,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { tytDate, aytDate } = await req.json();
  const database = await getDb();
  const user = database.data.users.find((u) => u.id === userId);
  if (!user) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  if (tytDate) user.tytDate = tytDate;
  if (aytDate) user.aytDate = aytDate;
  await database.write();

  return NextResponse.json({ tytDate: user.tytDate, aytDate: user.aytDate });
}
