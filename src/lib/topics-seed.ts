// Default TYT & AYT topic lists seeded for every new user.
export type SeedTopic = { subject: string; topic: string };

export const TYT_SUBJECTS = ["Türkçe", "Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "Din Kültürü"] as const;
export const AYT_SUBJECTS = ["Matematik", "Fizik", "Kimya", "Biyoloji", "Edebiyat", "Tarih", "Coğrafya", "Felsefe"] as const;

export const TYT_TOPICS: SeedTopic[] = [
  // Matematik
  ...["Temel Kavramlar", "Sayı Basamakları", "Bölme ve Bölünebilme", "OBEB-OKEK", "Rasyonel Sayılar", "Ondalık Sayılar", "Basit Eşitsizlikler", "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar", "Çarpanlara Ayırma", "Oran Orantı", "Denklem Çözme", "Problemler (Sayı)", "Problemler (Yaş)", "Problemler (Hareket)", "Problemler (İşçi-Havuz)", "Problemler (Yüzde-Kar Zarar)", "Problemler (Karışım)", "Kümeler", "Fonksiyonlar", "Polinomlar", "İkinci Dereceden Denklemler", "Permütasyon-Kombinasyon", "Olasılık", "Veri-İstatistik", "Trigonometri", "Geometri: Üçgenler", "Geometri: Çokgenler", "Geometri: Çember-Daire", "Geometri: Katı Cisimler", "Analitik Geometri"].map((t) => ({ subject: "Matematik", topic: t })),
  // Türkçe
  ...["Sözcükte Anlam", "Cümlede Anlam", "Paragrafta Anlam", "Paragrafta Yapı", "Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri", "Sözcükte Yapı/Ekler", "İsimler", "Zamirler", "Sıfatlar", "Zarflar", "Edat-Bağlaç-Ünlem", "Fiiller", "Fiilde Anlam (Kip-Kişi)", "Ek Fiil", "Fiilimsi", "Cümlenin Ögeleri", "Cümle Türleri", "Anlatım Bozukluğu"].map((t) => ({ subject: "Türkçe", topic: t })),
  // Fizik
  ...["Fizik Bilimine Giriş", "Madde ve Özellikleri", "Sıvıların Kaldırma Kuvveti", "Basınç", "Isı, Sıcaklık ve Genleşme", "Hareket ve Kuvvet", "İş, Güç ve Enerji", "Elektrostatik", "Elektrik Akımı", "Manyetizma", "Optik (Aydınlanma-Gölge)", "Dalgalar"].map((t) => ({ subject: "Fizik", topic: t })),
  // Kimya
  ...["Kimya Bilimi", "Atom ve Yapısı", "Periyodik Sistem", "Kimyasal Türler Arası Etkileşim", "Maddenin Halleri", "Doğa ve Kimya", "Kimyanın Temel Kanunları", "Mol Kavramı", "Kimyasal Tepkimeler", "Asit, Baz ve Tuz", "Karışımlar", "Kimya Her Yerde"].map((t) => ({ subject: "Kimya", topic: t })),
  // Biyoloji
  ...["Canlıların Ortak Özellikleri", "Canlıların Temel Bileşenleri", "Hücre", "Hücre Zarından Madde Geçişi", "Canlıların Sınıflandırılması", "Ekosistem Ekolojisi", "Güncel Çevre Sorunları"].map((t) => ({ subject: "Biyoloji", topic: t })),
  // Tarih
  ...["Tarih ve Zaman", "İnsanlığın İlk Dönemleri", "Ortaçağ'da Dünya", "İlk ve Orta Çağlarda Türk Dünyası", "İslam Tarihi", "Türk İslam Devletleri", "Beylikten Devlete Osmanlı", "Dünya Gücü Osmanlı", "Arayış Yılları", "Değişim Çağı", "Uluslararası İlişkiler", "Devrimler Çağı", "En Uzun Yüzyıl", "Milli Mücadele", "Atatürkçülük"].map((t) => ({ subject: "Tarih", topic: t })),
  // Coğrafya
  ...["Doğa ve İnsan", "Dünya'nın Şekli ve Hareketleri", "Coğrafi Konum", "Harita Bilgisi", "İklim Bilgisi", "Yerin Şekillenmesi (İç Kuvvetler)", "Yerin Şekillenmesi (Dış Kuvvetler)", "Su, Toprak, Bitki", "Nüfus", "Göç", "Yerleşme", "Türkiye Ekonomisi", "Bölgeler", "Çevre ve Toplum"].map((t) => ({ subject: "Coğrafya", topic: t })),
  // Felsefe
  ...["Felsefenin Konusu", "Bilgi Felsefesi", "Varlık Felsefesi", "Ahlak Felsefesi", "Sanat Felsefesi", "Din Felsefesi", "Siyaset Felsefesi", "Bilim Felsefesi", "İlk Çağ Felsefesi", "MÖ 6-MS 2. yy Felsefesi", "Ortaçağ Felsefesi"].map((t) => ({ subject: "Felsefe", topic: t })),
  // Din Kültürü
  ...["Bilgi ve İnanç", "İslam ve İbadet", "Ahlaki Tutum ve Davranışlar", "Din ve Hayat", "Kur'an'a Göre Hz. Muhammed", "Yaşayan Dinler"].map((t) => ({ subject: "Din Kültürü", topic: t })),
];

export const AYT_TOPICS: SeedTopic[] = [
  // Matematik AYT
  ...["Fonksiyonlarda Uygulamalar", "Polinomlarda Uygulamalar", "2. Dereceden Denklemler (İleri)", "Karmaşık Sayılar", "Eşitsizlikler", "Parabol", "Trigonometri (İleri)", "Logaritma", "Diziler", "Limit", "Türev", "İntegral", "Analitik Geometri (İleri)", "Permütasyon-Kombinasyon-Olasılık (İleri)"].map((t) => ({ subject: "Matematik", topic: t })),
  // Fizik AYT
  ...["Vektörler", "Kuvvet ve Hareket", "Enerji ve Hareket", "İtme ve Momentum", "Tork ve Denge", "Kütle Merkezi", "Basit Harmonik Hareket", "Elektrik Alan ve Potansiyel", "Manyetik Alan ve İndüksiyon", "Çembersel Hareket", "Kütle Çekim ve Kepler Kanunları", "Elektromanyetik Dalgalar", "Atom Fiziği ve Radyoaktivite", "Modern Fizik", "Dalga Mekaniği"].map((t) => ({ subject: "Fizik", topic: t })),
  // Kimya AYT
  ...["Modern Atom Teorisi", "Gazlar", "Sıvı Çözeltiler ve Çözünürlük", "Kimyasal Tepkimelerde Enerji", "Kimyasal Tepkimelerde Hız", "Kimyasal Tepkimelerde Denge", "Asit-Baz Dengesi", "Çözünürlük Dengesi", "Kimya ve Elektrik", "Organik Kimyaya Giriş", "Organik Kimya (Hidrokarbonlar)", "Enerji Kaynakları ve Bilimsel Gelişmeler"].map((t) => ({ subject: "Kimya", topic: t })),
  // Biyoloji AYT
  ...["Sinir Sistemi", "Endokrin Sistem ve Hormonlar", "Duyu Organları", "Destek ve Hareket Sistemi", "Sindirim Sistemi", "Dolaşım ve Bağışıklık Sistemi", "Solunum Sistemi", "Üriner Sistem", "Üreme Sistemi ve Embriyonik Gelişim", "Komünite ve Popülasyon Ekolojisi", "Genden Proteine", "Hücre Bölünmeleri ve Üreme", "Kalıtımın Genel İlkeleri", "Ekosistem Ekolojisi (İleri)", "Canlılık ve Enerji (Fotosentez-Kemosentez)", "Canlılık ve Enerji (Solunum)", "Bitki Biyolojisi", "Canlılar ve Çevre"].map((t) => ({ subject: "Biyoloji", topic: t })),
  // Edebiyat
  ...["Güzel Sanatlar ve Edebiyat", "Şiir Bilgisi", "Edebi Sanatlar", "Anlatım Türleri", "Metin Türleri", "Türk Edebiyatı Dönemleri (İslamiyet Öncesi)", "Halk Edebiyatı", "Divan Edebiyatı", "Tanzimat Edebiyatı", "Servet-i Fünun Edebiyatı", "Milli Edebiyat", "Cumhuriyet Dönemi Şiiri", "Cumhuriyet Dönemi Romanı", "Dünya Edebiyatı"].map((t) => ({ subject: "Edebiyat", topic: t })),
  // Tarih AYT
  ...["Türk-İslam Devletlerinde Toplum ve Ekonomi", "20. yy Başlarında Osmanlı ve Dünya", "I. Dünya Savaşı", "Milli Mücadele Hazırlık Dönemi", "TBMM'nin Açılması ve İç Ayaklanmalar", "Kurtuluş Savaşı Cepheleri", "Atatürk İlkeleri ve İnkılapları", "Atatürk Dönemi Türk Dış Politikası", "II. Dünya Savaşı ve Türkiye", "Soğuk Savaş Dönemi", "Yumuşama Dönemi ve Sonrası", "Küreselleşen Dünya"].map((t) => ({ subject: "Tarih", topic: t })),
  // Coğrafya AYT
  ...["Biyoçeşitlilik", "Ekstrem Doğa Olayları", "Nüfus Politikaları", "Türkiye'de Tarım", "Türkiye'de Sanayi", "Türkiye'de Ulaşım", "Türkiye'de Ticaret ve Turizm", "Bölgesel Kalkınma Projeleri", "Küresel Ortam: Bölgeler ve Ülkeler", "Çevre ve Toplum (İleri)"].map((t) => ({ subject: "Coğrafya", topic: t })),
  // Felsefe (AYT - Felsefe Grubu)
  ...["Bilgi Felsefesi (İleri)", "Bilim Felsefesi (İleri)", "Sanat Felsefesi (İleri)", "Din Felsefesi (İleri)", "Ahlak Felsefesi (İleri)", "Siyaset Felsefesi (İleri)", "Psikolojiye Giriş", "Sosyolojiye Giriş", "Mantığa Giriş"].map((t) => ({ subject: "Felsefe", topic: t })),
];
