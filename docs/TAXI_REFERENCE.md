# Taksi — Kullo Chosen

Tarih: 2026-11-05.

## Chosen

| Kaynak | Not |
|--------|-----|
| **Easy Ride** Figma | `R4FzLGuOgGlNwngqYDLygs` — Yolcu/Paket toggle, map shell |
| **Obr Taxi** (cihaz) | Hub IA: cüzdan · 2×2 servis · promo carousel · alt nav |
| **Careem** (cihaz) | Büyük Taxi + Airport tile · Confirm pick-up · destination search · Booking options |
| Harita SDK | Emlak ile aynı: `components/OsmMap.tsx` (OSM + Leaflet WebView) |
| Marka | Kullo ink + flame — Obr/Careem/Uber asset yok |

## Ekranlar

| Rota | İçerik |
|------|--------|
| `/taxi` (`app/taxi/index.tsx`) | Ortak AppHeader + kompakt 4 servis tile + dens promo satır listesi (tek büyük kart yok), koyu alt nav |
| `/taxi/book` (`app/taxi/book.tsx`) | Map booking: Confirm pick-up → arama listesi → Booking options → quote (Yolcu\|Paket) |
| `/driver` | Taksici \| Paket taşı toggle + mock seferler |

## Akış

```
Hub (density)
├── AppHeader: [Geri]→Erbil→Arama→Dil→IQD→Cüzdan
├── 4 kompakt servis tile → book / shared-ride
├── Promo dens list (satır + küçük thumb)
└── Koyu alt nav → Ev / Etkinlik / Ödeme / Gelen / Hesap

book steps
├── pickup → Confirm pick-up sheet (harita)
├── search → Now|For me + destination list (tam ekran)
├── options → Date/time Now · Booking for Me · Confirm
└── quote → Yolcu|Paket · araç/boyut · fiyat · CTA
```

## Screenshot

- `.rea-refs/screenshots/obr-ref-01-hub.png` … `obr-ref-07-booking-options.png` — kaynak
- `.rea-refs/screenshots/kullo-taxi-home-match.png` — hub eşleşme
- `.rea-refs/screenshots/kullo-taxi-map-match.png` — map / confirm pickup
