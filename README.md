# Kullo (kullo.berqenas.com) — Irak Genel Pazarı Süper-App

Kullo, 5 dilde (Kürtçe Badini/Sorani, Arapça, Türkçe, İngilizce, Farsça) çalışan, AI destekli, mobil öncelikli süper-app platformudur.

## Özellikler

### Araç Pazarı
- AI destekli görsel araç tanıma (marka, model, yıl)
- AI fiyat tahmini ve açıklanabilir fiyat breakdown
- AI hasar tespiti (çoklu açı fotoğraftan)
- Dinamik kiralama fiyatlandırması
- Dealer/Showroom profilleri + puanlama

### Taksi & Ulaşım
- Anlık taksi çağırma
- Paylaşımlı yolculuk
- Havalimanı transferi
- Sürücü konum takibi

### Yemek Sipariş
- Restoran listeleme
- Sipariş yönetimi
- Kurye takibi

### Ortak Özellikler
- Otomatik çoklu dil çevirisi (OpenRouter)
- AI asistan (doğal dilde arama)
- Konum tabanlı arama (PostGIS)
- Gerçek zamanlı mesajlaşma
- Favoriler, kaydedilmiş aramalar
- Kullo Cüzdan (Hatwan / IQD)

## Mimari

```
React Native (Expo) ─► Nginx ─► PostgREST  ─► PostgreSQL 16 + PostGIS
                              ├► AI Service ─► OpenRouter
                              ├► Auth Service (Fastify JWT)
                              ├► Redis (cache + realtime)
                              └► MinIO (görsel/video)
```

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Mobil | React Native + Expo SDK 52 |
| API | PostgREST 12 + Fastify (auth/AI) |
| DB | PostgreSQL 16 + PostGIS + pg_trgm |
| Cache | Redis 7 |
| Storage | MinIO (S3-API) |
| AI | OpenRouter (500+ model) |
| Container | Docker Compose |

## Hızlı Başlangıç

### Önkoşullar
- Docker + Docker Compose
- Node.js 22+
- pnpm 9+
- Expo CLI (`npm i -g expo-cli`)
- iOS Simulator veya Android Emulator (mobil geliştirme için)

### Kurulum

```bash
# 1. Repo'yu klonla
git clone https://github.com/ferhatdeveloper/kullo.git
cd kullo

# 2. Environment dosyasını kopyala
cp .env.example .env
# .env içindeki secretları düzenle (özellikle JWT_SECRET, POSTGRES_PASSWORD, OPENROUTER_API_KEY)

# 3. Backend servislerini başlat
docker compose up -d

# 4. Bağımlılıkları kur
pnpm install

# 5. Mobil uygulamayı başlat (tüketici)
cd apps/mobile
pnpm start

# 6. Partner uygulamasını başlat (sürücü/merchant)
cd apps/partner
pnpm start
```

Expo Go ile QR kodu tarayın ve uygulama açılacaktır.

## Diller

- `tr` — Türkçe (varsayılan)
- `en` — İngilizce
- `ar` — Arapça (RTL)
- `fa` — Farsça (RTL)
- `ku-bad` — Kürtçe Badini (LTR)
- `ku-sor` — Kürtçe Sorani (RTL)

## Uygulamalar

| App | Açıklama | Platform |
|-----|----------|----------|
| `apps/mobile` | Tüketici süper-app | iOS, Android (Expo) |
| `apps/partner` | Sürücü/Merchant uygulaması | iOS, Android (Expo) |
| `apps/web` | Marketing web sitesi | Web (Vite) |

## Yol Haritası

- [x] Faz 1 — Temel altyapı (monorepo, Docker, DB, auth, Expo bootstrap)
- [x] Faz 2 — AI temel (OpenRouter, vision, price, translate)
- [x] Faz 3 — Sosyal & keşif (favoriler, arama, mesajlaşma)
- [x] Faz 4 — Kiralama modülü
- [x] Faz 5 — Taksi & yolculuk modülü
- [x] Faz 6 — Yemek sipariş modülü
- [x] Faz 7 — Partner uygulaması (sürücü/merchant)
- [ ] Faz 8 — Store yayını, production deployment

## Lisans

MIT — bkz. [LICENSE](./LICENSE)