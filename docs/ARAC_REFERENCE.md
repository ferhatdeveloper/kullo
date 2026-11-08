# Araç dikeyi — Dubicars piksel / yapı blueprint (Kullo)

Kaynak: cihaz runtime `6544bc4b`, paket `com.dubicars.dubicars` **2.5.5**.  
Taze yakalamalar: `.rea-refs/screenshots/dubicars-clone-*.png` (2026-11-03).  
Marka / purple / reklam kopyalanmaz — **IA + ölçüler + kart anatomisi** Kullo token’larıyla uygulanır.

## Kanıt dosyaları

| Dosya | Ekran |
|-------|--------|
| `dubicars-first-top.png` | **First page** — hero + smart services (2026-11-03 taze) |
| `dubicars-first-mid.png` | First page mid — top picks + dealers |
| `dubicars-first-bottom.png` | First page bottom — featured dealers + nav |
| `videos/dubicars-home.mp4` | Home scroll screenrecord (~12s) |
| `dubicars-home-frame-{1,2,3}.png` | Video’dan 3 kare |
| `COMPARE-dubicars-first.png` / `COMPARE-kullo-first.png` | Side-by-side proof |
| `dubicars-clone-home.png` | Home hub (hero + services + nav) |
| `dubicars-clone-home-scroll.png` | Top picks · dealers band |
| `dubicars-clone-search.png` | SERP chrome + listing card |
| `dubicars-clone-filter.png` | Filters sheet |
| `dubicars-clone-sell.png` | Sell entry |
| `dubicars-clone-saved.png` | Saved Ads \| Searches |
| `dubicars-clone-more.png` | More menu |
| `dubicars-clone-detail.png` | Detail + sticky Call/WA |
| `dubicars-clone-nav.png` | Bottom nav (Home aktif) |

---

## Dubicars first page (measured)

Cihaz: `6544bc4b` · fiziksel **1080×2412** · density **420** (scale **2.625** · 1 dp ≈ 2.625 px).  
Kaynak PNG: `dubicars-first-top|mid|bottom.png` + `dubicars-home.mp4`.  
Kullo uygulaması **purple kopyalamaz** — aşağıdaki dp ölçüleri flame / mist / paper token’lara map edilir.

### Sayfa krom

| Ölçü | px | dp | Not |
|------|----|----|-----|
| Page bg | — | — | `#F2F2F7` (hero dışı şerit) |
| H margin (hero / kartlar) | 42 | **16** | sol/sağ boşluk |
| App logo bar (status altı) | ≈80–200 | ≈30–46 | DUBICARS + bayrak; Kullo → `AppHeader` |

### Hero kart

| Ölçü | px | dp | Kullo hedef |
|------|----|----|-------------|
| Kart üst (status+logo sonrası) | ≈288 | — | `marginTop` 8–12 |
| Kart yükseklik (üst→alt beyaz) | **983** | **≈375** | `minHeight` 360–380 |
| Köşe radius | inset eğrisi ≈48 px | **≈18–20** | **20–24** (görsel eşleşme) |
| İç padding H | ≈42–48 | **16–18** | `space.lg` |
| Headline satır 1 | — | 14–15 | bodyMed white |
| Headline satır 2 | — | 26–28 | display white; marka accent **flameMid** (purple değil) |
| Search pill üst→alt | ≈996–1049 (+üst AA) | **≈48** hedef | pill, bg white/mist, H **48** |
| Search ↔ CTA gap | ≈40 | **≈15** | `gap` 12–16 |
| CTA (purple band) | 1092–1216 = **125** | **≈48** | full-width, `colors.flame`, H **48–50**, radius pill |
| CTA fill (referans) | `#990099` | — | **Kullo: `flame` `#F36A1C`** |

### Smart services

| Ölçü | px | dp | Kullo |
|------|----|----|-------|
| Section title | — | 16–17 | displayMed |
| Kart genişlik (1. kart run) | **495** | **≈189** | width **190–220** |
| Kart gap / peek | ≈20–40 | 8–16 | `gap` 12 |
| Üst görsel H | ≈110–130 | **≈42–50** | image **118–128** |
| Alt metin band | paper/mist | — | title 15 + hint 12, pad 12 |
| Radius | — | **14–16** | `radius.lg` |

### Our top picks

| Ölçü | Not |
|------|-----|
| Başlık + “See all >” (accent) | sağda flame link |
| Kart | dikey; görsel üstte; “Top pick” pill sol üst (flame) |
| Kart W | ≈200–248 |
| Meta | `Şehir · gövde · yıl · km` nokta ayraç |

### Featured dealers

| Ölçü | Not |
|------|-----|
| Section title | “Öne çıkan galeriler” |
| Dealer satırı | ad (semi 15–16) · opsiyonel şehir |
| Listing kart | yatay: thumb ≈108×100 + title / price / `a \| y \| km` |
| Kart W | ≈300–312 · border hairline · radius md |

### Bottom nav (Home aktif)

| Ölçü | px | dp | Kullo |
|------|----|----|-------|
| Nav üst çizgi | ≈2214 | — | `borderTop` line |
| Bar (çizgi→ekran altı, gesture dahil) | **≈198** | **≈75** | paddingBottom safe-area |
| Aktif pill (lavender referans) | h **≈116** / görsel ≈44 dp | **≈44** | `flameSoft` pill W40×H32–36 |
| Aktif renk (referans) | icon+label purple `#990099`, pill `#E8DEF8` | — | icon+label **flame**, pill **flameSoft** |
| 5 tab | Home · Search · Sell · Saved · More | — | Ana · Ara · Sat · Kayıtlı · Daha |
| Sell | daire içinde + | — | flame primary daire OK (Kullo) |

### Scroll anatomisi (first page)

```
[AppHeader]
┌─ Hero (radius 20–24, minH ~375) ─┐
│  photo + scrim                     │
│  2-line headline                   │
│  search pill H48                   │
│  CTA flame H48 “N araç ara”        │
└────────────────────────────────────┘
Smart services — horizontal cards (image top)
Our top picks — rail + See all
Featured dealers — name + horizontal row cards
[BottomNav H~75 w/ inset · Home pill]
```

---

## Bottom nav (5) — sıra / rol / aktif

| # | Dubicars | Kullo | İkon | Aktif |
|---|----------|-------|------|-------|
| 1 | Home | **Ana** | Ev | Soft pill arka plan + accent label |
| 2 | Search | **Ara** | Büyüteç | Aynı |
| 3 | Sell | **Sat** | + daire (orta, yükseltilmiş) | Primary flame |
| 4 | Saved | **Kayıtlı** | Kalp | Soft pill |
| 5 | More | **Daha** | ☰ | Soft pill |

Yükseklik (1080×2412 referans): tab bar ≈ **88–100 dp** (safe-area dahil). Cross-vertical chip bar **yok**.

---

## 1) Home — scroll anatomisi

```
[AppHeader / logo]           ≈ 56–64 dp
┌─ Hero card ─────────────┐  margin H ≈ 16
│  Image fill + scrim     │  minH ≈ 280
│  Headline 20–22 / bold  │
│  Search field (pill)    │  H ≈ 48
│  Primary CTA full width │  H ≈ 50 · accent
└─────────────────────────┘
Section: Smart services     title 16–17 · gap 12
  Horizontal cards W≈220
  ┌ image 110 ┐
  │ text pad  │  title 15 + hint 12 · bg paper
Section: Our top picks      title + See all
  Horizontal featured cards W≈200–220
Section band (paper): Featured dealers
  Dealer row (avatar 40 · name · city) + horizontal cards
Section: Browse by brand
  Logo cells 52 + label · horizontal
[BottomNav]
```

**Home’da filtre formu yok.** Filtre yalnızca Search chrome / sheet.

---

## 2) Search / SERP

```
Sticky chrome (white)
├── Search field (flex) + Filter square btn ≈ 46
├── Chip row: Make · Price · Model · City   H ≈ 40
└── (opsiyonel bölge satırı)

Results header: “N results” · sort (accent)
Brand logo rail (opsiyonel, scroll)

Listing card (list variant)
├── Image H ≈ 196 · 1/N · heart
├── Price row + Top pick label (accent)
├── Title · subtitle
├── Specs: pin · year · km · …
└── Call (outline) · WhatsApp (filled accent/green)
```

---

## 3) Sell / Saved / More

| Ekran | Yapı |
|-------|------|
| **Sell** | `/vehicle-sell` — “ilan ver” giriş kartları |
| **Saved** | Tabs: İlanlar \| Aramalar · empty CTA |
| **More** | Login kartı · Hizmetler · Keşfet · Destek satırları |

---

## 4) Filter sheet

```
Header: Filtreler · Done
City chips · Brand grid · Model/Year/Price/Km selects · Condition
Sticky footer: Sıfırla · N araç göster
```

---

## 5) Detail

```
Gallery full-bleed ≈ 340
Overlays: Back · Share · Heart · dots · 1/N
Seller card · Price · Title · key specs
Overview 2-col grid
Sticky: Call (primary) · WhatsApp (yeşil)
```

---

## Kart anatomisi (özet)

| Varyant | Kullanım | Ana parçalar |
|---------|----------|--------------|
| `featured` | Home top picks / dealers | Image + Top pick pill · title · price · meta dots |
| `list` | SERP | Büyük görsel · fiyat+badge · title · specs · Call/WA |
| `row` | Yoğun listeler | Thumb + chips (ikincil) |

---

## Kullo eşleme

| Blueprint | Kod |
|-----------|-----|
| Shell nav (buy) | `CarsShell` + `VerticalShell` — **yalnızca satın alma** |
| Shell nav (rent) | `RentalsShell` — **yalnızca kiralama** (buy ile karışmaz) |
| Deep link | `/cars/buy` · `/cars/rent` · `?intent=buy\|rent` · `?mode=buy\|rent` |
| **Ana (buy first page)** | `components/cars/DubicarsHome.tsx` + `cars-home.styles.ts` |
| Buy Home / SERP / Saved / More | `app/(tabs)/search.tsx` — `intent=buy` |
| Rent list / filter IA | `app/(tabs)/rentals.tsx` — günlük/aylık, depozito, uygunluk |
| Sell | `/vehicle-sell` |
| Buy detail | `app/vehicle/[id].tsx` — satış fiyatı |
| Rent detail | `app/rental/[id].tsx` — IQD/gün · depozito |
| Cards | Buy: `VehicleCard` · Rent: `RentalCard` |
| Brands | `DEMO_BRANDS` + `BrandLogo` (her zaman görünür) |
| Proof | `.rea-refs/screenshots/kullo-cars-buy.png` · `kullo-cars-rent.png` |

Global marketplace tab’ları (Mağazalar / Hesap) araç shell içinde **gizli** (`tabBarStyle: display none` on `search`).

## Dışlamalar

Dubicars purple / logo / “Exclusively on…” / valuation ürün / VIP paket / ads SDK.

---

## Kullo v2 mirror checklist (vs Dubicars screens)

Kanıt: `.rea-refs/screenshots/dubicars-az-*.png` ↔ Kullo proof `.rea-refs/screenshots/kullo-cars-v2-*.png`

| # | Dubicars yüzey | Kullo v2 | Durum |
|---|----------------|----------|--------|
| 1 | Bottom nav 5 roller (Home·Search·Sell·Saved·More) | Ana·Ara·Sat·Kayıtlı·Daha + soft pill aktif | ✅ |
| 2 | Home hero (headline + search + “Search N cars”) | `Cars` home hero + Kullo CTA | ✅ |
| 3 | Smart services yatay kart (Sell / Browse) | Sat → `/vehicle-sell` · Satılık ara → buy SERP (Kirala ayrı dikey) | ✅ |
| 4 | Our top picks rail | Öne çıkanlar `featured` VehicleCard | ✅ |
| 5 | Browse by brand (logos always visible) | DEMO_BRANDS / API + BrandLogo rail | ✅ |
| 6 | Featured dealers band | DEMO_STORES + listing rail | ✅ |
| 7 | Home’da dense filter form **yok** | Filtre yalnızca SERP sheet | ✅ |
| 8 | SERP sticky search + filter btn + chips | results chrome + Filter modal | ✅ |
| 9 | Listing cards (büyük görsel · Call/WA) | `VehicleCard` `list` | ✅ |
| 10 | Detail sticky Call + WhatsApp | `vehicle/[id].tsx` | ✅ (önceki) |
| 11 | Cross-vertical chip bar yok | Super-app Emlak/Shop/Food cars shell’de yok | ✅ |
| 12 | Kullo brand tokens only | `colors` / `fonts` — purple chrome yok | ✅ |

Proof screenshots:
- `COMPARE-dubicars-first.png` — Dubicars first page (taze)
- `COMPARE-kullo-first.png` — Kullo Ana after `DubicarsHome`
- `dubicars-first-top|mid|bottom.png` + `videos/dubicars-home.mp4`
- `kullo-cars-v2-hub.png` — Ana hub (önceki)
- `kullo-cars-v2-search.png` — Ara SERP
- `kullo-cars-v2-nav.png` — alt nav (Ana aktif)
