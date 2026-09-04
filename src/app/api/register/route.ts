import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { getDb } from "@/lib/db";
import { TYT_TOPICS, AYT_TOPICS } from "@/lib/topics-seed";
import { ESTIMATED_TYT_DATE, ESTIMATED_AYT_DATE } from "@/lib/exam-rules";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tüm alanları doldurmalısın." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
    }

    const database = await getDb();
    const exists = database.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = uuid();

    database.data.users.push({
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashed,
      createdAt: new Date().toISOString(),
      tytDate: ESTIMATED_TYT_DATE,
      aytDate: ESTIMATED_AYT_DATE,
    });

    // Seed default TYT & AYT topic trackers for the new user
    let order = 0;
    for (const t of TYT_TOPICS) {
      database.data.topics.push({
        id: uuid(),
        userId,
        examType: "TYT",
        subject: t.subject,
        topic: t.topic,
        explanation: false,
        test: false,
        status: "Başlanmadı",
        order: order++,
      });
    }
    order = 0;
    for (const t of AYT_TOPICS) {
      database.data.topics.push({
        id: uuid(),
        userId,
        examType: "AYT",
        subject: t.subject,
        topic: t.topic,
        explanation: false,
        test: false,
        status: "Başlanmadı",
        order: order++,
      });
    }

    // Seed one starter playlist course
    const courseId = uuid();
    database.data.courses.push({
      id: courseId,
      userId,
      title: "Örnek Playlist",
      order: 0,
      createdAt: new Date().toISOString(),
    });
    database.data.videos.push({
      id: uuid(),
      courseId,
      title: "1. Bölüm - Giriş",
      url: "https://www.youtube.com/",
      watched: false,
      order: 0,
    });

    await database.write();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Bir şeyler ters gitti." }, { status: 500 });
  }
}
