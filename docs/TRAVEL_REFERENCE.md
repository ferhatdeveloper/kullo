# Seyahat / Transfer — Kullo

Tarih: 2026-11-07.

## Chosen

| Kaynak | Not |
|--------|-----|
| Seed | `apps/mobile/lib/travel/seed.ts` — yerler + uçuş/otobüs/özel araç demo |
| Uçak API | `apps/mobile/lib/travel/flightsApi.ts` — interface + `DemoFlightsProvider` (şimdi) |
| Otobüs API | `apps/mobile/lib/travel/busApi.ts` — ayrı adapter stub |
| Özel araç | `apps/mobile/lib/travel/privateTransfer.ts` — mock fiyat; OsmMap |
| Marka | Kullo ink + flame — üçüncü parti meta-arama markası / logo yok |
| Para | IQD (+ opsiyonel `fee_iqd` platform ücreti) |
| IA referans | `com.ucuzabilet` v3.6.13 — yalnızca bilgi mimarisi + layout (asset kopyası yok) |

## REA / referans paket

| Alan | Değer |
|------|--------|
| Paket | `com.ucuzabilet` |
| Sürüm | 3.6.13 (versionCode 653) |
| APK | `.rea-refs/apks/com.ucuzabilet/base.apk` |
| Evidence | `inspect_android_package` → package/SDK; runtime UI dump + screenshots |
| Screenshot | `.rea-refs/screenshots/ucuzabile-*.png` |
| Kullo kanıt | `.rea-refs/screenshots/kullo-travel-flights-ucuzabile.png`, `kullo-travel-bus-ucuzabile.png` |
| REA inspect | `com.ucuzabilet` 3.6.13 (653) — minSdk 32 / targetSdk 37 |

### Gözlenen IA (uçak / otobüs)

1. **Kompakt arama formu** — Nereden / Nereye (üst üste, sağda swap), tarih + yolcu yan yana; CTA tek satır.
2. **Sonuç kartı** — sol: taşıyıcı + saatler / süre / aktarma; **sağ: fiyat**.
3. **Tek filtre yüzeyi** — sonuçta chip şeridi yok; sırala/filtre alt aksiyon veya sheet.
4. Hub’da hizmet sekmeleri (Uçak / Otobüs / …) — Kullo’da Uçak / Otobüs / Özel araç.

## Ekranlar

| Rota | İçerik |
|------|--------|
| `/travel` | Hub — **Uçak / Otobüs / Özel araç** tab + kompakt arama formu |
| `/travel/flights/search` | Uçak arama (from/to/date/pax) |
| `/travel/flights/results` | Sonuç listesi + tek **Filtre** sheet (chip şeridi yok) |
| `/travel/bus/search` | Otobüs arama |
| `/travel/bus/results` | Sonuç listesi + Filtre sheet |
| `/travel/private/book` | Özel transfer teklifleri + OsmMap + rezervasyon (demo) |

## Giriş noktaları

- Ana daire kısayol → `/travel`
- SuperHomeFeed hizmet rayı → `/travel`
- Hizmetler → Mobilite → **Seyahat** (tek hub kartı; 3 tab içeride)

## Akış

```
Hub (3 tab)
├── Uçak → results → seç (Alert demo)
├── Otobüs → results → seç (Alert demo)
└── Özel araç → private/book → teklif seç → Rezerve (demo)
```

## Filtre

Tek `TravelFilterSheet` — aktarma, kabin/koltuk, fiyat üst sınırı, sıralama.  
Liste üstünde **çok satır chip şeridi yok**; aktif filtre sayısı Filtre CTA’da gösterilir.

## API bağlama (sonra)

Env placeholder’lar (`apps/mobile`):

| Değişken | Amaç |
|----------|------|
| `EXPO_PUBLIC_FLIGHTS_API_URL` | Uçak sağlayıcı base URL |
| `EXPO_PUBLIC_FLIGHTS_API_KEY` | Bearer / API key |
| `EXPO_PUBLIC_FLIGHTS_USE_DEMO` | `true` (varsayılan) → daima demo; `false` + URL/key → canlı dene, hata olursa demo’ya düş |
| `EXPO_PUBLIC_BUS_API_URL` | Otobüs sağlayıcı base URL |
| `EXPO_PUBLIC_BUS_API_KEY` | API key |
| `EXPO_PUBLIC_BUS_USE_DEMO` | Aynı mantık |

Canlı iskelet şu an `POST {base}/v1/flights/search` ve `POST {base}/v1/buses/search` bekler; yanıt şekli `{ offers: FlightOffer[] | BusOffer[] }`. Gerçek sağlayıcı sözleşmesi bağlanırken mapper eklenir — UI tipleri değişmeden kalır.

Özel araç için harici API şart değil; sürücü ataması taksi dikeyiyle birleştirilebilir.

## Screenshot

- `.rea-refs/screenshots/kullo-travel-hub.png`
- `.rea-refs/screenshots/kullo-travel-flights-ucuzabile.png`
- `.rea-refs/screenshots/kullo-travel-bus-ucuzabile.png`
- `.rea-refs/screenshots/ucuzabile-01-home-flight.png`
- `.rea-refs/screenshots/ucuzabile-02-home-bus.png`
- `.rea-refs/screenshots/ucuzabile-04-flight-results.png`
- `.rea-refs/screenshots/ucuzabile-05-filter.png`
