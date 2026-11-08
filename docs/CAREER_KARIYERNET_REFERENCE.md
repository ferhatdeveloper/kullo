# Kariyer — cihaz referansı (kariyer.net)

Tarih: 2026-11-08.  
Kapsam: yetkili cihaz, yalnız IA/UI referans. Marka asset / purple tema kopyalanmaz; Kullo ink + flame.

| Kaynak | Not |
|--------|-----|
| Paket | `com.kariyer.androidproject` |
| Sürüm | `8.20.2` (`versionCode` 550), minSdk 26 / targetSdk 36 |
| APK | `.rea-refs/apks/com.kariyer.androidproject/base.apk` |
| Launcher | `AuthenticationActivity` → oturumda `MainActivity` |
| REA | `inspect_android_package` + UI dump + runtime screenshot |

## Alt tab’ler (4)

| Tab (UI) | Resource / sınıf | İçerik |
|----------|------------------|--------|
| Ana Sayfa | `navigation_jobsearch` / home Compose | Arama + popüler + öne çıkan + plan + alarm |
| İşlerim | `navigation_my_jobs_container` | İncelediklerim · Kaydettiklerim · Başvurularım (+ Tercihler / Mülakat) |
| Bildirimler | `navigation_notifications` | Push / sistem bildirim listesi |
| Hesabım | `navigation_profile` | Özgeçmiş, görünürlük, ayarlar, open-to-work |

## IA ağacı

```
Ana Sayfa
├── Logo + arama alanı («Pozisyon veya şirket ara»)
├── Popüler Aramalar (yatay chip)
├── Öne Çıkan İlanlar (yatay dens kart; logo + başlık + şirket + konum)
├── Kariyerini Planla → Etkinlikler · Pozisyonlar · Maaşlar · CV Örnekleri
└── İş Alarmı CTA

Arama (SearchActivity / GS)
├── Pozisyon alanı + Konum («Tüm Türkiye»)
├── Öneri listesi: Pozisyon · Şirketlerde Ara · Anahtar Kelime
└── Ara → SearchResultActivity

Sonuç listesi
├── Anahtar kelime + «N İş İlanı»
├── Chip rayı: Filtre · Konum · Çalışma Tercihi · Pozisyon
├── Dens ilan satırları (sponsorlu + organik)
└── Sticky «İş Alarmı kur»

Filtre (JobAlarmFilter / FilterSearch)
├── Sıralama: Öne Çıkan · Önerilen · Yeniden eskiye · Eskiden yeniye
├── Ülke / Şehir / İlçe
├── Çalışma Tercihi · Tarih · Sektör · Pozisyon Seviyesi · Departman · Çalışma Şekli
└── Filtreyi Uygula

İlan detay (JobDetailActivity)
├── Başlık · şirket · konum · tag’ler (Hibrit / Tam Zamanlı / seviye / sektör)
├── «N+ Başvuru» · güncelleme tarihi
├── İş İlanı Hakkında (collapse «Daha Fazla Göster»)
├── Benzer ilan alarmı switch
└── Sticky: Kaydet | Başvur

İşlerim
├── Üst: İş İlanlarım · Tercihlerim · Mülakatlarım
└── Chip: İncelediklerim · Kaydettiklerim · Başvurularım

Hesabım
├── Avatar · open-to-work toggle
└── Özgeçmişlerim (güç % · görünürlük · yükle / oluştur)
```

## İlan kartı yapısı (dens — ölçek için)

Kaynak model: `ui.searchresult.model.IJobCard` (+ sonuç listesi UI dump).

| Alan | Kaynak | Not |
|------|--------|-----|
| Logo | `getLogoFullPath` / sol kare | Hero cover yok |
| Başlık | `getTitle` | Bold, 1–2 satır |
| Şirket | `getCompanyName` | |
| Konum · çalışma modeli | `getLocationText` / `txt_location_and_work_model` | örn. `İstanbul(Asya) · Hibrit` |
| Çalışma şekli | `work_type` / leftText | örn. Tam Zamanlı |
| Sağ meta | `getRightText` | göreli tarih (`3 gün`) |
| Sponsor | `isSponsored` | «Sponsorlu İlan» üst etiket |
| Kaydet | bookmark ikon | kart sağ üst |
| Başvuru durumu | `isApplyStatusVisible` | örn. «İncelendi» |

Öne çıkan (home carousel) aynı dens dil: logo + başlık + şirket + konum; **16:9 şişkin cover yok**.

Kural (Kullo): milyonlarca / uzun liste için **tek şişkin kart tercih etme**; list = dens satır; rail/featured = kompakt logo kart.

## Uygulandı / kaldı (checklist)

| # | Madde | Durum |
|---|--------|--------|
| 1 | Dens `JobCard` (logo sol, cover yok) | Uygulandı |
| 2 | Ana: Son Aramalar + benzer dens ray + Plan + Alarm + AI banner | Uygulandı (zengin seed) |
| 3 | AppBar = Market `AppHeader` (logo yok; Geri·Konum·Arama·Dil·IQD·Cüzdan) | Uygulandı |
| 4 | Sticky Kaydet \| Başvur + detay tag | Uygulandı |
| 5 | İşlerim: İncele / Kaydet / Başvuru (+ Tercihler / Mülakat) | Uygulandı (iskelet) |
| 6 | Filtre tek sheet + sıralama | Uygulandı |
| 7 | Piksel-perfect spacing vs kariyer.net purple tema | Kısmi — ink/flame; IA hizalı |
| 8 | Bildirimler / Hesabım canlı içerik derinliği | Gap (demo boş/özet) |
| 9 | Gerçek şirket logoları | Gap (initials + OfflineCover) |

Mevcut Kullo rotalar: `/career` · `/career/[id]` · `/career/apply` · `/career/employer`.

## Screenshot

| Dosya | Ekran |
|-------|--------|
| `.rea-refs/screenshots/kariyer-net-01-home.png` | Ana Sayfa |
| `.rea-refs/screenshots/kariyer-net-02-my-jobs.png` | İşlerim |
| `.rea-refs/screenshots/kariyer-net-03-notifications.png` | Bildirimler |
| `.rea-refs/screenshots/kariyer-net-04-profile.png` | Hesabım |
| `.rea-refs/screenshots/kariyer-net-05-search.png` | Arama / öneri |
| `.rea-refs/screenshots/kariyer-net-06-search-results.png` | Sonuç listesi + dens kart |
| `.rea-refs/screenshots/kariyer-net-07-job-detail.png` | İlan detay + sticky CTA |
| `.rea-refs/screenshots/kariyer-net-08-filter.png` | Filtreler sheet |

## Manifest notları (özet)

Önemli activity’ler: `MainActivity`, `SearchActivity`, `SearchResultActivity`, `FilterSearchActivity`, `JobDetailActivity`, `PreApplyJobActivity` / `EasyApplyActivity`, `JobAlarmActivity`, resume/profile ailesi. Class count ~55k (büyük Compose + legacy mix).
