// Hedef üniversite seçimi için en çok bilinen 20 üniversite.
// `slug` alanı, /public/universities/{slug}.jpg altında aranacak
// kapak fotoğrafının dosya adıyla birebir eşleşir.
export type University = {
  slug: string;
  name: string;
};

export const UNIVERSITIES: University[] = [
  { slug: "bogazici", name: "Boğaziçi Üniversitesi" },
  { slug: "odtu", name: "Orta Doğu Teknik Üniversitesi (ODTÜ)" },
  { slug: "itu", name: "İstanbul Teknik Üniversitesi (İTÜ)" },
  { slug: "koc", name: "Koç Üniversitesi" },
  { slug: "sabanci", name: "Sabancı Üniversitesi" },
  { slug: "bilkent", name: "Bilkent Üniversitesi" },
  { slug: "hacettepe", name: "Hacettepe Üniversitesi" },
  { slug: "ankara", name: "Ankara Üniversitesi" },
  { slug: "istanbul", name: "İstanbul Üniversitesi" },
  { slug: "marmara", name: "Marmara Üniversitesi" },
  { slug: "ege", name: "Ege Üniversitesi" },
  { slug: "gazi", name: "Gazi Üniversitesi" },
  { slug: "dokuz-eylul", name: "Dokuz Eylül Üniversitesi" },
  { slug: "yildiz-teknik", name: "Yıldız Teknik Üniversitesi" },
  { slug: "galatasaray", name: "Galatasaray Üniversitesi" },
  { slug: "tobb-etu", name: "TOBB Ekonomi ve Teknoloji Üniversitesi" },
  { slug: "bilgi", name: "İstanbul Bilgi Üniversitesi" },
  { slug: "ozyegin", name: "Özyeğin Üniversitesi" },
  { slug: "anadolu", name: "Anadolu Üniversitesi" },
  { slug: "akdeniz", name: "Akdeniz Üniversitesi" },
];
