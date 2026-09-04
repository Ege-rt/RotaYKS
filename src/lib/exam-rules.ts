// Gerçek YKS sınav yapısı (ÖSYM'nin güncel TYT/AYT formatına göre).
// Kaynak: ÖSYM YKS Kılavuzu - her oturumun ders/soru sayısı dağılımı.

export type SubjectQuestionMap = Record<string, number>;

export const TYT_RULES = {
  label: "TYT — Temel Yeterlilik Testi",
  totalQuestions: 120,
  durationMinutes: 165,
  subjects: {
    "Türkçe": 40,
    "Matematik": 40,
    "Fizik": 7,
    "Kimya": 7,
    "Biyoloji": 6,
    "Tarih": 5,
    "Coğrafya": 5,
    "Felsefe": 5,
    "Din Kültürü": 5,
  } as SubjectQuestionMap,
};

export type AytTrackKey = "sayisal" | "ea" | "sozel" | "dil";

export const AYT_TRACKS: Record<
  AytTrackKey,
  { label: string; totalQuestions: number; durationMinutes: number; subjects: SubjectQuestionMap }
> = {
  sayisal: {
    label: "Sayısal",
    totalQuestions: 80,
    durationMinutes: 180,
    subjects: {
      "Matematik": 40,
      "Fizik": 14,
      "Kimya": 13,
      "Biyoloji": 13,
    },
  },
  ea: {
    label: "Eşit Ağırlık",
    totalQuestions: 80,
    durationMinutes: 180,
    subjects: {
      "Matematik": 40,
      "Edebiyat": 24,
      "Tarih": 10,
      "Coğrafya": 6,
    },
  },
  sozel: {
    label: "Sözel",
    totalQuestions: 80,
    durationMinutes: 180,
    subjects: {
      "Edebiyat": 24,
      "Tarih": 21,
      "Coğrafya": 17,
      "Felsefe": 12,
      "Din Kültürü": 6,
    },
  },
  dil: {
    label: "Yabancı Dil (YDT)",
    totalQuestions: 80,
    durationMinutes: 120,
    subjects: {
      "Yabancı Dil": 80,
    },
  },
};

export const AYT_TRACK_OPTIONS: { key: AytTrackKey; label: string }[] = [
  { key: "sayisal", label: "Sayısal" },
  { key: "ea", label: "Eşit Ağırlık" },
  { key: "sozel", label: "Sözel" },
  { key: "dil", label: "Yabancı Dil (YDT)" },
];

// ÖSYM'nin resmi 2027 YKS takvimi henüz açıklanmadı. Önceki yılların
// takvimine dayanan tahmini tarihlerdir; kullanıcı Ayarlar sayfasından
// değiştirebilir.
export const ESTIMATED_TYT_DATE = "2027-06-19T10:15:00";
export const ESTIMATED_AYT_DATE = "2027-06-20T10:15:00";
