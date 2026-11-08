# Emlak dikeyi — Paya + Homele (REA)

Kaynak: cihazdan çekilen APK’ler + runtime ekran yakalama (2026-11-03).  
Paketler: `com.paya.paragon` (Paya 1.4.3), `com.homeiq` (Homele / HomeIQ 4.4.9).  
Flutter AOT: `split_config.arm64_v8a` içindeki `libapp.so` (base APK’de lib yok).  
Marka/asset kopyalanmaz; **bilgi mimarisi ve akış** Kullo’ya uyarlanır.

## REA kanıtı

| Artifact | SHA-256 (özet) | Not |
|----------|----------------|-----|
| `paya.apk` | `7bc2b8c8…` | package `com.paya.paragon`, v1.4.3 |
| `paya-arm64.apk` | Flutter AOT hash `78da37fe…` | libapp + libflutter |
| `homele.apk` | `772de20f…` | package `com.homeiq`, v4.4.9 |

Yerel kopyalar: `.rea-refs/apks/`.

## Paya üst taraf (canlı ekran 2026-11-03)

```
AppBar (şehir silüeti bg)
├── ☰ hamburger (sol, yuvarlak cam)
├── Selected City · Erbil ▾ (sol-orta, dropdown)
└── Search pill (sağ, cam + büyüteç)

İçerik (krem zemin)
├── Proje hero carousel (yuvarlatılmış, dash/dot pagination)
├── Pair grid 2 kolon (fiyat + mahalle overlay, Sale/Rent badge, tip·yatak·banyo)
├── Chip row: Sort · Filters · Rent & Buy · Property Type
└── Feed kartı (galeri okları, Sale, kalp, Ad)
```

Alt menü: Home · Projects · + · Agencies · Profile  
Harita / AI banner / şehir kartları / hot rail **Paya üstünde yok** (Homele’de var).

## Ortak IA (Kullo’ya alınan)

```
Emlak hub
├── AppBar (Kullo) + dikey başlık
├── Araçlar: şehir · sırala · filtre · harita · favori
├── Projeler slider (Homele hero + yatay kartlar)
├── AI arama banner
├── Şehir kartları
├── Pair grid (2 kolon vitrin — Paya)
├── Kısayol: Projeler · Ajanslar · İlan ver
├── Hot rail (Homele) + Tümü
├── Feed listesi
├── Dikey alt menü: Keşfet · Harita · İlan · Favori · Projeler
└── Filtre sheet: arama · amaç · tip · oda · m² · sırala
```

## Referans ekranlar (AOT string)

**Paya:** `HomePage`, `ExploreMapPage`, `FavoritesPage`, `AgenciesPage`, `AgencyDetailsPage`, `/projects`, `/saved_searches`, `/filter_*`, WhatsApp iletişim.

**Homele:** `HomeScreen`, `HomeMapViewScreen` (GoogleMap), `AiSearchScreen`, `FilterScreen`, `AgenciesListScreen`, `ProjectsListScreen`, `SavedSearchScreen`, `PropertyDetailScreen`, `Hot Sale`.

## Kullo eşleme

| Referans | Kullo |
|----------|--------|
| Emlak hub | `app/(tabs)/realty.tsx` |
| Kart | `components/RealtyCard.tsx` (pair / rail / feed) |
| Filtre sheet | `components/RealtyFilterSheet.tsx` |
| Filtre motoru | `lib/realty-filters.ts` |
| Favoriler | `lib/realty-favorites-store.ts` + `app/realty/favorites.tsx` |
| AI arama | `app/realty/ai-search.tsx` |
| Harita | `app/realty/map.tsx` + `components/OsmMap.tsx` (OSM/Leaflet) |
| Ajanslar | `app/realty/agencies.tsx` |
| Projeler listesi | `app/realty/projects.tsx` |
| Proje detay | `app/realty/project/[id].tsx` |
| Detay | `app/realty/[id].tsx` |
| İlan ver | `app/realty-sell.tsx` |
| Koordinat | `lib/realty-map.ts` |

## Bilinçli olarak alınmayanlar

- Homele **Community** (ticket / misafir / move-request) — site yönetimi dikeyi
- Paya **Local Expert** — ayrı dikey
- Google Maps API (anahtar yok) → OSM WebView

## Notlar

- Dikey adı kodda **`realty`**.
- Mobile `applicationId`: `com.berqenas.kullo` (proje: kullo.berqenas.com).
