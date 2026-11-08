# Oteller — Kullo

Tarih: 2026-11-07.

## Chosen

| Kaynak | Not |
|--------|-----|
| Seed | `apps/mobile/lib/hotels-catalog.ts` — 12 bölge oteli |
| Envanter | `apps/mobile/lib/hotels-inventory-store.ts` — AsyncStorage `hotels-inventory` (otel → odalar + foto) |
| Görseller | OfflineCover + `offline-image-map` home foto id’leri (otel + oda seed) |
| Marka | Kullo ink + flame |
| Para birimi | IQD (gecelik) |

## UI v2 / örnek IA

Örnek yapılara bakıldı (layout IA only — marka asset / logo kopyası yok):

| Kaynak | Alınan IA |
|--------|-----------|
| [Holidu mobile list item](https://holidu.design/price-matters-our-new-mobile-list-item/) | Büyük cover, fiyat sağ alt tag, rating/review vurgusu |
| Booking / Hotels.com / Expedia (ScreensDesign flow) | Liste kartı → detay hero/galeri → sticky Rezerve bar |
| Airbnb-style property detail pattern | Full-bleed hero, amenities, sticky price + CTA |
| KAYAK / sleek hotel booking templates | Filter chip strip, oda tipi satırı |

**Kullo v2 kart:** 16:9 (liste) / 3:2 (ray) cover · ink scrim · şehir chip · fiyat sağ alt · ★ + yorum · featured badge.

**Detay:** edge hero · foto sayacı · **yatay oda kartları** (cover + ad + kapasite + stok + gece fiyatı) · oda galeri sheet · amenities 2-kolon · sticky ink **Rezerve et** (seçili oda fiyatı).

**Filtre:** yatay ink şehir + flame olanak/yıldız chip’leri + `HotelFilterSheet` (şehir, fiyat, yıldız, olanak, sıralama).

**Ana ray:** `HotelCard` `variant="rail"` — SuperHomeFeed ile aynı dil.

## Ekranlar

| Rota | İçerik |
|------|--------|
| `/hotels` | Arama + Filtre CTA + chip strip + `HotelCard` list |
| `/hotels/[id]` | Hero, oda rayı + galeri, olanaklar, seçili odaya bağlı rezervasyon |
| `/hotels/manage` | Otel seç → oda ekle/düzenle/sil (fiyat IQD, kapasite, stok, tip + seed foto) |

## Giriş noktaları

- Ana daire kısayol + üst chip → `/hotels`
- SuperHomeFeed yatay **Oteller** rayı (`HotelCard` rail)
- Hizmetler / mode-select kartı → `/hotels`
- Profil → İşletme → **Otelim** → `/hotels/manage`
- Liste header hotel ikonu → `/hotels/manage`

## Akış

```
Liste (şehir / olanak chip + FilterSheet)
└── Detay
    ├── Oda kartı seç (foto + fiyat)
    └── Book sheet (seçili oda × gece × misafir) → demo Alert
Otel yönetimi
└── Oda CRUD → AsyncStorage hotels-inventory
```

## Screenshot

- `.rea-refs/screenshots/kullo-hotels-filter.png`
- `.rea-refs/screenshots/kullo-hotels-manage-rooms.png`
- `.rea-refs/screenshots/kullo-hotels-detail-rooms.png` (oda foto rayı)
- (v2 arşiv) `kullo-hotels-ui-v2-list.png`, `kullo-hotels-ui-v2-detail.png`
- (v1 arşiv) `kullo-hotels-list.png`, `kullo-hotels-detail.png`
