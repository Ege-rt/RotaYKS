import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const database = await getDb();
  const user = database.data.users.find((u) => u.id === userId);
  if (!user) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  return NextResponse.json({
    targetUniversity: user.targetUniversity || null,
    targetDepartment: user.targetDepartment || null,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { targetUniversity, targetDepartment } = await req.json();
  const database = await getDb();
  const user = database.data.users.find((u) => u.id === userId);
  if (!user) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  user.targetUniversity = targetUniversity || "";
  user.targetDepartment = targetDepartment || "";
  await database.write();

  return NextResponse.json({
    targetUniversity: user.targetUniversity,
    targetDepartment: user.targetDepartment,
  });
}
