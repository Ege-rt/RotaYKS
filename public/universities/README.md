# Üniversite Kapak Fotoğrafları

Bu klasöre, hedef üniversite banner'ında kullanılacak fotoğrafları koy.

## Kurallar
- Dosya adı, `src/lib/universities.ts` içindeki `slug` değeriyle BİREBİR aynı olmalı.
- Format: `.jpg` (küçük harf, uzantı dahil).
- Önerilen boyut: **1600x600px** (yatay, geniş banner oranı). Kare veya dikey fotoğraflar
  kırpılarak gösterilir, en iyi sonuç için yatay/geniş kadraj kullan.
- Dosya boyutu: mümkünse 300KB altı (site hızlı açılsın diye).

## Gereken 20 dosya

- bogazici.jpg — Boğaziçi Üniversitesi
- odtu.jpg — Orta Doğu Teknik Üniversitesi (ODTÜ)
- itu.jpg — İstanbul Teknik Üniversitesi (İTÜ)
- koc.jpg — Koç Üniversitesi
- sabanci.jpg — Sabancı Üniversitesi
- bilkent.jpg — Bilkent Üniversitesi
- hacettepe.jpg — Hacettepe Üniversitesi
- ankara.jpg — Ankara Üniversitesi
- istanbul.jpg — İstanbul Üniversitesi
- marmara.jpg — Marmara Üniversitesi
- ege.jpg — Ege Üniversitesi
- gazi.jpg — Gazi Üniversitesi
- dokuz-eylul.jpg — Dokuz Eylül Üniversitesi
- yildiz-teknik.jpg — Yıldız Teknik Üniversitesi
- galatasaray.jpg — Galatasaray Üniversitesi
- tobb-etu.jpg — TOBB Ekonomi ve Teknoloji Üniversitesi
- bilgi.jpg — İstanbul Bilgi Üniversitesi
- ozyegin.jpg — Özyeğin Üniversitesi
- anadolu.jpg — Anadolu Üniversitesi
- akdeniz.jpg — Akdeniz Üniversitesi

## Fotoğraf eksikse ne olur?
Bir üniversitenin fotoğrafı henüz eklenmemişse, uygulama otomatik olarak üniversite
adının baş harfleriyle şık bir mor gradyan kart gösterir — hiçbir yer bozuk görünmez.

## Yeni üniversite eklemek istersen
1. `src/lib/universities.ts` dosyasına `{ slug: "yeni-slug", name: "Yeni Üniversite" }` ekle.
2. Bu klasöre `yeni-slug.jpg` dosyasını koy.
