import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import fs from "fs";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  tytDate?: string;
  aytDate?: string;
  targetUniversity?: string;
  targetDepartment?: string;
};

export type Exam = {
  id: string;
  userId: string;
  name: string;
  type: "TYT" | "AYT";
  track?: string;
  publisher?: string;
  date: string;
  subjectNets: Record<string, number>;
  totalNet: number;
  createdAt: string;
};

export type Topic = {
  id: string;
  userId: string;
  examType: "TYT" | "AYT";
  subject: string;
  topic: string;
  explanation: boolean;
  test: boolean;
  status: "Başlanmadı" | "Devam Ediyor" | "Tamamlandı";
  order: number;
};

export type Course = {
  id: string;
  userId: string;
  title: string;
  coverImage?: string;
  sourceUrl?: string;
  order: number;
  createdAt: string;
};

export type VideoItem = {
  id: string;
  courseId: string;
  title: string;
  url: string;
  thumbnail?: string;
  watched: boolean;
  order: number;
};

export type StudyEntry = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  hours: number;
};

export type Preference = {
  id: string;
  userId: string;
  university: string;
  department: string;
  note?: string;
  order: number;
  createdAt: string;
};

type Data = {
  users: User[];
  exams: Exam[];
  topics: Topic[];
  courses: Course[];
  videos: VideoItem[];
  studyEntries: StudyEntry[];
  preferences: Preference[];
};

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const file = path.join(dataDir, "db.json");
const defaultData: Data = {
  users: [],
  exams: [],
  topics: [],
  courses: [],
  videos: [],
  studyEntries: [],
  preferences: [],
};

const adapter = new JSONFile<Data>(file);
export const db = new Low<Data>(adapter, defaultData);

let initialized = false;

export async function getDb() {
  if (!initialized) {
    await db.read();
    db.data ||= defaultData;
    // backfill in case of partial/older files
    db.data.users ||= [];
    db.data.exams ||= [];
    db.data.topics ||= [];
    db.data.courses ||= [];
    db.data.videos ||= [];
    db.data.studyEntries ||= [];
    db.data.preferences ||= [];
    await db.write();
    initialized = true;
  } else {
    await db.read();
  }
  return db;
}
