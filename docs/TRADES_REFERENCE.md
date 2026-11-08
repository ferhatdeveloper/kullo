# Usta iş — Kullo

Tarih: 2026-11-07.

## Chosen

| Kaynak | Not |
|--------|-----|
| Store | `apps/mobile/lib/trades-store.ts` — AsyncStorage `kullo.trades_v1` |
| Seed | 6 iş ilanı + teklifler (offline ilk hydrate) |
| Komisyon | `apps/mobile/lib/kullo-commission.ts` — mock %5 (B2B ile aynı helper, ayrı store) |
| Marka | Kullo ink + flame |
| Para birimi | IQD |

## Akış

```
İş ilanı (müşteri)
└── Usta / personel teklif verir (tutar + gün + not)
    └── Müşteri kabul → Kullo komisyon kırılımı (brüt / komisyon / net)
```

Roller: **İş veren** | **Usta / personel** (store’da toggle).

## Ekranlar

| Rota | İçerik |
|------|--------|
| `/trades` | Liste · şehir/kategori filtre · rol toggle · (+) ilan |
| `/trades/create` | Yeni iş ilanı (başlık, açıklama, kategori, şehir, bütçe) |
| `/trades/[id]` | Detay · teklif formu (usta) · teklif listesi · kabul + komisyon |

## Giriş noktaları

- Ana daire kısayol → `/trades` (**Usta iş**)
- Hizmetler featured kart → `/trades`
- SuperHomeFeed hizmet rayı → `/trades`

## Screenshot

- `.rea-refs/screenshots/kullo-trades-list.png`

## Not

`app/b2b` ve `app/career` bu dikeye dahil değil; paylaşılan hub/ana kartlar ayrı entry.
