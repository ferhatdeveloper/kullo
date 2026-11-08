# Toptancı (B2B) — Kullo

Tarih: 2026-11-07.

## Chosen

| Kaynak | Not |
|--------|-----|
| Store | `apps/mobile/lib/b2b-store.ts` — AsyncStorage `kullo.b2b_v1` (seed offline) |
| Komisyon | `apps/mobile/lib/kullo-commission.ts` — mock `%5` (`KULLO_COMMISSION_RATE`) |
| Marka | Kullo ink + flame |
| Para birimi | IQD (teklif / komisyon / net) |
| Roller | Firma · Toptancı (liste üstü toggle) |

## Ekranlar

| Rota | İçerik |
|------|--------|
| `/b2b` | Talep listesi · rol toggle · durum chip · (+) talep |
| `/b2b/create` | Firma ürün ihtiyacı formu |
| `/b2b/[id]` | Teklifler · Kullo komisyon kırılımı · kabul / teklif gönder |

## Giriş noktaları

- Ana dairesel kısayol **Toptancı** → `/b2b`
- Hizmetler featured kart **Toptancı** → `/b2b`

## Akış

```
Firma: talep oluştur
└── Toptancı: birim fiyat teklifi
    └── Firma: teklif kabul
        └── Kullo komisyon (mock %) brüt / komisyon / net
```

## Seed

- 4 talep (gıda, inşaat, elektronik, ambalaj)
- 5 teklif (biri önceden kabul edilmiş)

## Screenshot

- `.rea-refs/screenshots/kullo-b2b-list.png`
