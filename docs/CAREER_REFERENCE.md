# Kariyer — Kullo

Tarih: 2026-11-07.

## Chosen

| Kaynak | Not |
|--------|-----|
| Seed | `apps/mobile/lib/career-catalog.ts` — 10 iş ilanı (Erbil / Ankawa / Suli / Duhok) |
| Başvurular | `apps/mobile/lib/career-store.ts` — AsyncStorage `kullo.career_applications_v1` |
| Eşleştirme | İşveren paneli: seed adaylar + kullanıcının başvuruları |
| Görseller | OfflineCover + `CAREER_PHOTO_IDS` (home ofis foto id’leri) |
| Marka | **Kariyer** / Kullo ink + flame (rakip marka adı yok) |
| Para birimi | IQD (aylık brüt aralık) |

## Ekranlar

| Rota | İçerik |
|------|--------|
| `/career` | Arama + şehir / kategori / çalışma tipi chip + `JobCard` list |
| `/career/[id]` | Hero, tanım, arananlar, sticky **Başvur** |
| `/career/apply?id=` | CV özeti formu → AsyncStorage başvuru |
| `/career/employer` | İşveren paneli mock · açık ilanlar + eşleştirme listesi |

## Giriş noktaları

- Ana daire kısayol → `/career`
- SuperHomeFeed yatay **Kariyer** rayı (`JobCard` rail)
- Hizmetler / mode-select kartı → `/career`
- Liste header bina ikonu → `/career/employer`

## Akış

```
Liste (şehir / kategori / çalışma chip)
└── Detay
    └── Başvur (CV özeti) → AsyncStorage applications
İşveren paneli
└── Eşleştirme listesi (seed + başvurular)
    └── İlan detayına git
```

## Screenshot

- `.rea-refs/screenshots/kullo-career-list.png`
