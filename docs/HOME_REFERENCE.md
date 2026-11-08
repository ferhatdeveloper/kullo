# Ana sayfa — iBazzar + Trendyol (REA)

Kaynak cihaz: `6544bc4b` (2026-11-04).  
Marka / asset kopyalanmaz; **bilgi mimarisi ve üst viewport** Kullo flame/ink paletine uyarlanır.

## Paketler

| App | Package | Sürüm | APK yolu |
|-----|---------|-------|----------|
| iBazzar | `net.ibazzar.ibazzar` | 3.5.24 (272) | `.rea-refs/apks/ibazzar*.apk` → `net.ibazzar.ibazzar/` |
| Trendyol | `trendyol.com` | 8.23.1.1461 | `.rea-refs/apks/trendyol*.apk` → `trendyol.com/` |
| Hepsiburada | `com.pozitron.hepsiburada` | (cihazda; bu turda referans değil) | — |

SHA-256 (özet): iBazzar base `d65c6d1570cad208…` · Trendyol base `04684ecdc6814213…`.

## REA özeti

### iBazzar (Flutter AOT)

- Host: `MainActivity`; UI Flutter (`libapp.so` / `split_config.arm64_v8a`).
- Dart izleri: `products_screen.dart`, `header_categories.dart`, `rectangle_section.dart`, `CategoryGridShortcut`, `MarketplaceBottomNavigationWidget`.
- Canlı IA (ekran: `ibazzar-home-top.png`, `ibazzar-home-mid.png`):
  - Dikey hub kartları (`ibazzar` · `motors` · `real estate` · `marketplace`)
  - Arama pill + bildirim
  - Kategori chip’leri (`For you` aktif)
  - Promo banner + marka vitrin
  - Dairesel kategori grid
  - 2×2 / feed bölümleri
  - Alt: Home · Categories · Discounts · Cart · Profile

### Trendyol (native / Compose)

- `com.trendyol.main.impl.ui.MainActivity`; dikeyler: `MealActivity`, `GroceryActivity`, Luxury / Dolap / International.
- Homepage sınıfları: `com.trendyol.home.impl…HomepageTabbarDiscoveryButtonModel*`.
- Canlı IA (`trendyol-home-top.png`, `trendyol-home-mid.png`):
  - **Arama-merkezli** AppBar (hamburger · search · mesaj · zil)
  - Hero promo carousel
  - Yatay dikey kısayollar (Yemek, Hızlı Market, …)
  - “Sana özel” yatay ürün rayları + See All
  - İkincil promo şeritleri
  - Alt: Ana Sayfa · Go · Favoriler · Sepet · Hesap

## Density / scale (kalıcı)

Milyonlarca kayıt varsayımı: UI **minimal, yoğun, tarama-dostu**.  
**Tek büyük kart / hero card / sparse card grid tercih etme** — kompakt satır (row) ve küçük çoklu tile strip; gereksiz padding/shadow/radius kart yığını yok.  
Liste yüzeyleri FlatList/FlashList benzeri sanallaştırmaya uygun kalsın; yeni ağır kart sarmalayıcı ekleme.

## Ortak IA → Kullo (dense sections)

```
Ana (süper-app) — yoğun marketplace keşif (ink + flame)
├── AppHeader variant=market (kompakt ink şerit)
│   └── [Geri?] → Konum → Arama → Dil → IQD → Cüzdan
├── Fırsat banner (kompakt carousel)
├── Dairesel dikey kısayollar
└── SuperHomeFeed compact — çok section, boş state yok
```

**Dense rule:** her dikeyden en az bir görsel içerikli ray; section header + “Tümünü gör”; mock/offline seed ile boş hissi yok; spacing sıkı.  
Tek ürün/hero kartı yerine dens list + yatay compact strip.

### Offline demo (ağ / API yok)

Demo backend veya Wi‑Fi kapalıyken bile Ana + dikeyler **liste + görsel + metin** dolu kalır (boş state / sonsuz spinner yok):

| Katman | Ne |
|--------|-----|
| Query | `networkMode: offlineFirst`; Ana / Araç / Kiralık `initialData` + `DEMO_*` |
| API | `api.ts` 4s timeout → `DEMO_*` seed (`EXPO_PUBLIC_USE_DEMO_FALLBACK`) |
| Marketplace | AsyncStorage `kullo.marketplace_offline_v5` (emlak / goods / shops / restaurants) |
| Hotels / Health / Taxi | Lokal katalog / inventory seed; taxi Unsplash id → `offline-image-map` |
| Mart / Food | `martCatalog` + `OfflineImage` / `OfflineCover` |
| Görseller | `offline-image-map` + remote fail → brand/mist placeholder |

Smoke kanıt (wifi/data kapalı, Metro USB `adb reverse`):  
`.rea-refs/screenshots/kullo-offline-demo-home.png` · `kullo-offline-demo-realty.png` · `kullo-offline-demo-cars.png` (+ isteğe bağlı mart/hotels).

Kanıt: `.rea-refs/screenshots/kullo-home-dense.png` (+ mid scroll).

| Referans | Kullo |
|----------|--------|
| Ana hub | `apps/mobile/app/(tabs)/index.tsx` |
| AppBar | `components/brand/AppHeader.tsx` (`variant="market"`) |
| Feed | `components/SuperHomeFeed.tsx` (`compact`) |
| Cars / Mart giriş | `/(tabs)/search?carsPane=home`, `/(tabs)/mart?martPane=home` — bozulmaz |

## Bilinçli olarak alınmayanlar

- Trendyol / iBazzar logo, pembe-turuncu marka asset’leri, ürün fotoğrafları
- Sepet / Favoriler / Discounts alt sekmeleri (Kullo tab bar ayrı)
- Görsel arama kamerası, Dolap / Luxe / Go ortak markaları
