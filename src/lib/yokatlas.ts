// YÖK Atlas'ın resmi bir API'si yok ve taban puan/sıralama verileri her yıl
// değişiyor. Bu yüzden burada sabit/tahmini sayı üretmiyoruz — bunun yerine
// kullanıcıyı doğrudan resmi ve güncel kaynağa yönlendiriyoruz.

export type PuanTuru = "sayisal" | "ea" | "sozel" | "dil";

const PUAN_TURU_MAP: Record<PuanTuru, string> = {
  sayisal: "say",
  ea: "ea",
  sozel: "soz",
  dil: "dil",
};

// Resmi YÖK Atlas "Tercih Sihirbazı" aracı — puan türüne göre filtrelenmiş
// tablo. Öğrenci burada gerçek zamanlı taban puan/sıralama/kontenjan görür.
export function yokAtlasWizardUrl(puanTuru: PuanTuru) {
  return `https://yokatlas.yok.gov.tr/tercih-sihirbazi-t4-tablo.php?p=${PUAN_TURU_MAP[puanTuru]}`;
}

export function yokAtlasHomeUrl() {
  return "https://yokatlas.yok.gov.tr/lisans-anasayfa.php";
}

// Belirli bir üniversite/bölüm için YÖK Atlas'ın kendi arama sonucuna
// (Google üzerinden) yönlendirir — üniversite/program iç kodlarını tahmin
// etmek yerine her zaman doğru sonuca ulaşmayı garanti eden yöntem budur.
export function yokAtlasSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(`yokatlas ${query}`)}`;
}
