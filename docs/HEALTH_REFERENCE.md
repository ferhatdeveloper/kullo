# Sağlık — Kullo

Tarih: 2026-11-07.

## Chosen

| Kaynak | Not |
|--------|-----|
| Seed | `apps/mobile/lib/health-catalog.ts` — 10 doktor/klinik (Erbil / Ankawa / Suli / Duhok) |
| Randevular | `apps/mobile/lib/health-appointments-store.ts` — AsyncStorage `kullo.health_appointments_v1` |
| Görseller | OfflineCover + `offline-image-map` home ofis foto id’leri |
| Marka | Kullo ink + flame |
| Para birimi | IQD (konsültasyon) |

## Ekranlar

| Rota | İçerik |
|------|--------|
| `/health` | Arama + şehir / uzmanlık / görüşme tipi chip + `DoctorCard` list |
| `/health/[id]` | Hero, biyografi, görüşme tipleri, müsait slotlar, sticky **Randevu al** |
| `/health/book?id=` | Gün (bugün/yarın) · saat · **Online görüntülü / Telefon / Mesajlaşma** → onay |
| `/health/appointments` | Randevularım · **Görüşmeyi başlat** (meet / tel / chat iskeleti) |

## Giriş noktaları

- Ana daire kısayol + üst chip → `/health`
- SuperHomeFeed yatay **Sağlık & doktor** rayı (`DoctorCard` rail)
- Hizmetler / mode-select kartı → `/health`
- Liste header takvim ikonu → `/health/appointments`

## Akış

```
Liste (şehir / uzmanlık / görüşme chip)
└── Detay
    └── Book (gün × saat × tip) → AsyncStorage appointments
Randevularım
└── Görüşmeyi başlat
    ├── video → /meet/[id] (mock)
    ├── phone → tel: deep link
    └── chat → /chat/[id]
```

## Screenshot

- `.rea-refs/screenshots/kullo-health-list.png`
- `.rea-refs/screenshots/kullo-health-book.png`
