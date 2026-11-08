# Kullo Mart — market + food (kaynak + IA)

**Birincil kaynak (Mac, açık kaynak):** `/Users/ferhatnas/App/M10APP`  
Eski/ikiz kopya (SDK 57, daha az güncel): `/Users/ferhatnas/App/Kucoglu` — **port için M10APP kullan.**

Yeni market sıfırdan yazılmaz. M10APP’nin market IA / ekran / sepet / katalog kalıpları Kullo’ya taşınır; **yemek (food) Mart kabuğu içinde** yaşar.

İkincil REA (food-inside-mart hub örüntüsü): Talabat / Lezzoo / Toters — yalnızca dikey birleştirme referansı; marka/asset kopyalanmaz.

---

## Mac kaynak — M10APP

| Alan | Değer |
|------|--------|
| Path | `/Users/ferhatnas/App/M10APP` |
| Paket adı | `m10` · Expo slug `m10` · display **M10 Market** |
| Bundle | `com.m10.app` (cihazda yüklü; APK: `.rea-refs/apks/com.m10.app/`) |
| Sürüm | `1.0.2` (versionCode 4) |
| Stack | **Expo SDK 58 + React Native 0.88 + React 19** (Hermes; Flutter değil) |
| Nav | `@react-navigation` native-stack + bottom-tabs |
| Veri | Mock JSON + AsyncStorage (demo backend yok) |
| Katalog UI | `src/data/martCatalog.js` + `src/screens/Home.jsx` (Talabat Mart yoğun home) |
| Sepet | `src/screens/Cart.jsx` + `AppContext` (`addToCart`, `cartCount`, min order) |
| Assets | `assets/mart-clone/` (kategori / marka / banner cutout’lar) |

### Yeniden kullanılacak parçalar (port önceliği)

| M10APP | Ne işe yarar | Kullo hedefi |
|--------|--------------|--------------|
| `src/screens/Home.jsx` | Market home: Flash · Buy again · category pager · brand grid · aisle rails · sticky cart bar | `mart` hub / Market tab |
| `src/data/martCatalog.js` | CATEGORIES, BRANDS, BUY_AGAIN, aisles, promo rows | demo grocery seed / yapı |
| `src/screens/Cart.jsx` | Usualas + satırlar + sticky checkout + min order | birleşik Mart sepeti |
| `src/screens/Category.jsx` / `Store.jsx` / `ProductDetail.jsx` | Aisle list · store · PDP | `/mart/...` rotaları |
| `src/components/{TopBar,SearchField,AddToCartButton,ProductCard}.jsx` | Krom + hızlı ekle | Kullo token’larıyla yeniden stil |
| `src/context/AppContext.jsx` (cart slice) | store-scoped cart, fee, coupon | `food-cart-store` genişlet / `mart-cart-store` |
| `src/navigation/RootNavigator.jsx` | Tabs + stack ekran envanteri | `VerticalShell` Mart menüsü |
| `src/theme.js` + i18n `tr/en/ar` | Renk/spacing + etiketler | Kullo `theme` + locales (flame; M10 kırmızısı kopyalanmaz) |

**Bilinçli olarak alınmayanlar (şimdilik):** Butler, AR try-in-room, admin shell, courier mode, recipe chef, M10 Plus abonelik UI’si, RetailEX seed script’leri.

---

## M10APP market IA (kanıt: kaynak + runtime)

Cihaz yakalamalar: `.rea-refs/screenshots/m10-home.png`, `m10-categories.png`, `m10-aisle-scroll.png`.

### Bottom tabs (native; Home’da gizli)

| # | Tab | Ekran |
|---|-----|--------|
| 1 | Home | `Home.jsx` — **tabBarStyle: display none** (mart klonu hissi) |
| 2 | Search | `Search.jsx` |
| 3 | Butler | `Butler.jsx` (Kullo’ya taşınmaz) |
| 4 | Orders | `Orders.jsx` |
| 5 | Profile | `Profile.jsx` |

### Home scroll anatomisi

```
[TopBar: logo · teslimat adresi · pin · bell]
[SearchField pressable → Search]
FlashSaleBlock (sarı/kırmızı zamanlayıcı + ürün chip’leri)
Marka kartları rail (Nescafe / Pınar / …)
Buy again · ProductRow + View all
Shop by category · CategoryPager (3×4 + sayfa 2)
DealPromoStrip + PromoBannerSlider
Shop by brand · 2×4 squircle logo grid
Around the world · bayrak daireleri
Fresh / NESCAFÉ / Banetti · banner + ürün şeridi
Top savers · Dairy · Snacks · Beverages · Care
Explore Market · 2-kolon grid
[Sticky cart bar if cartCount > 0 → Cart]
```

### Sepet

- Sticky “View cart” bar (home) → `Cart`
- Empty: ikon + browse
- Dolu: usuals rail · satır qty · min order uyarısı · sticky Checkout → `Checkout`

### Aisle / kategori

`martCatalog.CATEGORIES` + `CATEGORIES_PAGE2` → `Category` / `Store` aisle param.  
Mock aisle ID’leri: `produce`, `bakery`, `dairy`, `drinks`, `snacks`, `frozen`, `household`, …

---

## İkincil REA — food inside mart (hub örüntüsü)

APK’lar: `.rea-refs/apks/{com.talabat,com.fastwares.lezzoo.eats,com.toters.customer}/`  
Ekranlar: `talabat-home.png`, `talabat-hub-scroll.png`, `talabat-food-or-restaurants.png`, `lezzoo-home.png`, `toters-market.png`.

| Uygulama | Stack (gözlem) | Hub modeli | Bottom nav |
|----------|----------------|------------|------------|
| **Talabat** 14.5.0 | Flutter (`libapp`/`libflutter` arm64) | Hub grid: **Food · talabat mart · Groceries · Stores · …**; feed’de restoran + mart Flash Sale karışık | Home · Orders · Account (3) |
| **Lezzoo** 4.5.4 | RN | Hub tile: **Food · Taxi · Mart** (Mart = grocery markası) | Home · Search · Profile (3) |
| **Toters** | Native (Kotlin) | Chip strip: **Tümü · Food · Fresh · toters+ · Market** | Anasayfa · Ara · Şoför · Siparişler · Hesap (5) |

**Kullo kararı (kanıt + ürün isteği):** Lezzoo/Talabat’taki “Food vs Mart peer tile” yerine **tek Kullo Mart kabuğu**; Food = Mart içi dikey (Toters chip / Talabat feed-karışımı + M10 market depth).

---

## Talabat Food Home (REA + canlı — 2026-11-04)

| Alan | Kanıt |
|------|--------|
| Paket | `com.talabat` · **14.5.0** (versionCode 2369) · minSdk 26 · targetSdk 36 |
| APK | `.rea-refs/apks/com.talabat/{base,split_config.arm64_v8a,split_config.xxhdpi}.apk` |
| Stack | Flutter (`FlutterLandingScreen` launcher; `io.flutter` / inappwebview) |
| Cihaz | `6544bc4b` · `start_adb_app` → cold launch |
| Ekranlar | `talabat-home-top.png`, `talabat-home-mid.png` (+ eski `talabat-home.png`, `talabat-hub-scroll.png`) |

### Home IA (üst → alt)

1. **Turuncu marka şeridi** — tek satır “Deliver to {adres} ▾” + sepet rozeti (şişman adres kartı yok).
2. **Beyaz pill arama** — “Search for food, groceries & more”.
3. **2×4 dikey/hub grid** — Food · Mart · Groceries · Stores · Health · Flowers · Coffee · Sweets (+ badge’ler: % / fast).
4. **Promo carousel** — Flash Sale / Order & Win / düşük teslimat ücreti.
5. **Popular brands** — yuvarlak logo rail + favori.
6. **Öneri rail’leri** — restoran kartı: logo/cover · indirim etiketi · ★ rating · ETA aralığı · teslimat ücreti (IQD).
7. **Order again / Flash Sale grocery** — marka kareleri + ürün grid.
8. **Alt nav (3)** — Home · Orders · Account.

### Kullo Ana (Yemek) eşlemesi

| Talabat | Kullo Mart Ana |
|---------|----------------|
| Turuncu header + deliver-to | **AppHeader** (ink) + pin’de kısa şehir; tap → kayıtlı adres sheet |
| Search pill | Flame hero strip içinde beyaz search |
| 2×4 hub | Food / Market / mutfak karoları (Market → Market tab) |
| Promo + brand rails | Flash banner + popüler daireler + yatay restoran rail |
| Restoran meta | ★ pill · ETA aralığı · teslimat ücreti · min sipariş |
| Market depth | Ayrı **Market** tab = M10 Home IA + Kullo skin |

---

## Mevcut Kullo durumu

| Rota / dosya | Bugün | Sorun |
|--------------|-------|--------|
| `app/(tabs)/shop.tsx` | Trendyol-benzeri **giyim** keşif | Grocery mart değil |
| `app/(tabs)/food.tsx` | Talabat-benzeri restoran listesi | Ayrı dikey; Mart’ın dışında |
| `app/food/[id].tsx`, `food-cart.tsx` | Menü + sepet | Food-only cart |
| `lib/food-cart-store.ts` | Restoran sepeti | Market aisle cart yok |
| `ServicesHub` | `shop` + `food` ayrı hub kartları | Birleşik Mart girişi yok |
| `VerticalShell` | Dikey kabuk hazır | Cars/realty kalıbı var; Mart shell yok |

---

## Hedef IA — Kullo Mart (food inside)

Tek giriş: hub → **Kullo Mart** (ServicesHub tek kart; eski `shop` grocery’ye dönüşür veya `mart` route).

```
Kullo Mart shell (VerticalShell, hide marketplace tabs)
├── Ana (Mart home)     ← M10 Home anatomisi + Food/Market geçiş chip’leri
├── Market              ← aisle / category / brand (M10 Category+Store)
├── Food                ← mevcut food.tsx restoran listesi (içerik)
├── Sepet               ← birleşik veya sekmeli (Market | Food)
└── Hesap / siparişler  ← profile + orders kısayolu (opsiyonel 5. tab)
```

### Önerilen bottom nav (5)

| # | Tab | Kaynak | Kullo |
|---|-----|--------|-------|
| 1 | Mart home | M10 Home | Keşif + Food/Market chips |
| 2 | Market | M10 categories | Aisle grid |
| 3 | Food | Kullo `food.tsx` | Restoran listesi |
| 4 | Sepet | M10 Cart + food-cart | Birleşik CTA |
| 5 | Hesap | M10 Profile / Kullo profile | Siparişler + adres |

Giyim C2C (`shop` bugünkü anlamı) Mart dışına alınır veya hub’da “Moda” ayrı dikey kalır — **Mart ≠ mevcut shop giyim**.

---

## Entegrasyon planı (reuse / port)

1. **Kaynak bağla:** dokümante path `M10APP`; port sırasında dosya kopyala → Kullo `components/mart/*`, `lib/mart-*` (isimler Kullo; `m10` markası UI’da yok).
2. **Shell:** `app/(tabs)/mart.tsx` (veya `shop` yeniden amaçlandır) + `VerticalShell` 5 tab; hub’da tek “Kullo Mart”.
3. **Market home:** `Home.jsx` anatomisini Kullo token’larıyla yeniden yaz; katalog iskeleti `martCatalog` kategorilerinden.
4. **Food içeri al:** `food.tsx` içeriği Mart → Food tab; `/food/*` ve `food-cart` deep link’leri shell içinde kalsın.
5. **Sepet:** kısa vadede sekmeli (Market | Food); orta vadede `mart-cart-store` (store/restaurant scoped lines).
6. **Demo veri:** grocery seed (M10 aisle şeması) + mevcut `restaurants` marketplace store. **Offline:** AsyncStorage `kullo.marketplace_offline_v5` + `OfflineCover`/`OfflineImage` — ağ yokken liste/kart lokal seed ile render (Unsplash/Migros fail → placeholder).
7. **REA ikincil:** restoran kart meta (ETA · fee · rating) Talabat/Lezzoo’dan; grocery depth M10’dan.

---

## Somut sonraki todo’lar

- [ ] Hub: `ServicesHub` → tek **Kullo Mart** girişi; `food`/`shop` ayrık kartlarını Mart altına çek
- [ ] `VerticalShell` Mart 5-tab iskeleti (`mart` route)
- [ ] M10 `Home.jsx` section listesini Kullo bileşenlerine map et (Flash / Buy again / CategoryPager / sticky cart)
- [ ] `martCatalog` kategori ID’lerini demo seed’e taşı (görseller: Kullo CDN veya placeholder; Migros URL’leri prod’a gitmez)
- [ ] `food.tsx` → Mart Food tab; `food-cart` Sepet tab’ına bağla
- [ ] Market cart stub (M10 `Cart.jsx` usuals + min order)
- [ ] i18n: `mart.*` anahtarları (tr/en/ar/ku); UI’da “M10” yok
- [ ] (Opsiyonel) `m10-categories` / Talabat hub screenshot’larını pixel ölçüm için kullan — marka rengi kopyalama

---

## Kanıt dosyaları

| Dosya | Not |
|-------|-----|
| `/Users/ferhatnas/App/M10APP` | **Birincil açık kaynak** |
| `.rea-refs/apks/com.m10.app/base.apk` | Cihaz pull · Expo/RN |
| `.rea-refs/screenshots/m10-*.png` | Market home / categories |
| `.rea-refs/screenshots/talabat-*.png` | Hub + food + mart flash (ikincil) |
| `.rea-refs/screenshots/talabat-ref-0{1..7}-*.png` | **Chosen B** kullanıcı screenshot’ları (2026-11-04) |
| `.rea-refs/screenshots/kullo-food-talabat-home.png` | Kullo Food hub (cihaz kanıtı) |
| `.rea-refs/screenshots/kullo-food-talabat-food-list.png` | Kullo Food list |
| `.rea-refs/screenshots/kullo-food-talabat-store.png` | Kullo Store (+ item sheet) |
| `.rea-refs/screenshots/COMPARE-kullo-food-home.png` | Kullo Ana yan yana |
| `.rea-refs/screenshots/kullo-food-ordering.png` | Chosen D — food_ordering Ana üst |
| `.rea-refs/screenshots/kullo-food-ordering-mid.png` | Chosen D — offer + 2-kolon kart |
| `.rea-refs/refs/food_ordering` | JSMastery clone (ref) |
| `.rea-refs/screenshots/kullo-food-hybrid-c.png` | Path C arşiv üst |
| `.rea-refs/screenshots/kullo-food-hybrid-c-mid.png` | Path C arşiv mid |
| `.rea-refs/screenshots/COMPARE-talabat-home.png` | Talabat home yan yana |
| `.rea-refs/screenshots/lezzoo-*.png` | Food · Taxi · Mart tiles (ikincil) |
| `.rea-refs/screenshots/toters-*.png` | Food/Market chip strip (ikincil) |

Cihazda ayrıca: `com.talabat`, `com.fastwares.lezzoo.eats`, `com.toters.customer`, `com.inovel.app.yemeksepeti`, `com.m10.app`.

---

## Food UI kaynak önerileri

**Chosen (2026-11-04 — kullanıcı screenshot’ları):** **Talabat birebir / pixel-yakın layout.** Referans PNG: `.rea-refs/screenshots/talabat-ref-01-hub.png` … `talabat-ref-07-search-results.png` (kullanıcı eki, 2026-11-04). Metin/logo = **Kullo** (“Delivered by Kullo”, “Kullo Pro”, “Kullo Mart”); UI’da Talabat “t” / “talabat” yok.

| Talabat ekran | Kullo |
|---------------|--------|
| Hub home (1+2) | `food-talabat/FoodTalabatHome` — **ink** Deliver to · 2×4 grid · promo · Pro · Redeem · rails |
| Food list (3) | `FoodTalabatList` — Food tile / hub’dan |
| Search (4+7) | `FoodTalabatSearch` |
| Store + item sheet (5+6) | `FoodTalabatStore` → `/food/[id]` |

Kod: `apps/mobile/components/mart/food-talabat/*` + `FoodExplore` re-export. Stiller **ayrı**: `mart-food-talabat.styles.ts` — `food-ordering/*` ve `mart-food.styles.ts` karışmaz.

**Renk (2026-11-05 — ink-ağır, kullanıcı kararı):** Market **ve** Food aynı orantı.
- **Her iki dikey** = Kullo **ink** (`#0C2D29`) header / TopBar / birincil CTA / sepet; zemin paper/mist; **flame** (`#F36A1C`) yalnızca badge / timer / küçük aksan.
- Kanıt: `.rea-refs/screenshots/kullo-market-ink-contrast.png`, `kullo-food-ink-heavy.png`.
- Arşiv (yanlış ters orantı): `kullo-market-orange-dominant.png`, `kullo-food-kullo-palette.png` (flame header).












**Önceki Chosen D — arşiv:** [JSMastery food_ordering](https://github.com/adrianhajdin/food_ordering); kod `food-ordering/*` kaldı, Ana artık kullanmıyor. Kanıt: `kullo-food-ordering.png`.

**Önceki Path C (hybrid) — arşiv:** Foodora + Talabat IA; `mart-food.styles.ts`; kanıt `kullo-food-hybrid-c.png`.

### Hazır Figma Community kit’leri (artık Chosen değil — arşiv)

| # | Başlık | URL | Neden (Iraq/MENA delivery) |
|---|--------|-----|----------------------------|
| 1 | **Foodora — Food Delivery Mobile UI Kit** | https://www.figma.com/community/file/1676290719681226139/foodora-food-delivery-mobile-ui-kit | Turuncu/krem delivery dili; home · search · restaurant · cart · tracking; Flash/promo + restoran keşfi kalıpları. |
| 2 | **Foodu - Food Delivery App UI Kit** | https://www.figma.com/community/file/1217650860899075419/foodu-food-delivery-app-ui-kit | 180+ ekran, design system; cuisine grid, promo, restoran kartı, sipariş akışı — production handoff için en geniş. |
| 3 | **Food Delivery Mobile App UI Kit** (Vlad) | https://www.figma.com/community/file/1352761962360670057/food-delivery-mobile-app-ui-kit | Uber Eats / Bolt Foods tarzı multi-vertical; home + discover + restaurant + order progress; renk değişkenleri. |
| 4 | **talabat App Clone** | https://www.figma.com/community/file/1296803578305032301/talabat-app-clone | MENA IA’ya en yakın clone; **yalnızca layout/IA** — Talabat asset/logo/renk kopyalanmaz. |
| 5 | **Talabat Mobile UI Design System & Starter Kit** (GIU lab) | https://www.figma.com/community/file/1685465148190554592/talabat-mobile-ui-design-system-starter-kit-ica-lab-03-giu | Home → food feed → menu wireframe + component listesi (search, category tile, restaurant card); eğitim amaçlı — marka token’ları Kullo’ya uyarlanır. |
| 6 | **Bobo Food Delivery App UI Kit** (ücretsiz) | https://www.figma.com/community/file/1455103829704120414/bobo-food-delivery-app-ui-kit-100-free-fast-and-reliable-food-delivery-at-your-doorstep | Ücretsiz hızlı başlangıç: search, kategori, featured restaurant (rating/ETA), promo banner. |

Market depth için (Food home değil): M10APP birincil; ek grocery kit ihtiyacında Smart Shop / GroFast Community dosyaları.

**Figma MCP:** `plugin-figma-figma` bu oturumda `needsAuth` — Community dosyası açma / FigJam moodboard API ile yapılmadı. Kullanıcı Figma’da duplicate + moodboard bağlayabilir.

### Yol seçimi (kilitli)

| Yol | Ne | Durum |
|-----|-----|--------|
| **A** | Figma kit → design-to-code | Seçilmedi |
| **B** | **Talabat birebir layout** (Kullo metin/logo; Food+Market = ink-ağır, flame aksan) | **Chosen** — kullanıcı screenshot 2026-11-04 · `food-talabat/*` |
| **C** | Hybrid: Foodora + Talabat IA + Kullo brand | Arşiv |
| **D** | JSMastery food_ordering + Kullo brand | Arşiv — `food-ordering/*` |

Food Ana: AppHeader kapalı; Deliver to = Kullo **ink**; Market TopBar = **ink**. Flame yalnızca badge/timer. Talabat trademark asset / “t” logosu yok.

---

## Food UI fix (2026-11-04)

**Sorun:** Path C hybrid ekranı marketplace kalitesinde değildi — emoji 2×4 mutfak grid, emoji’li Flash carousel, “Kullan ve kazan” peach kartlar, market Flash Sale ürün grid’i Yemek Ana’da, cream/lime AI look, zayıf hiyerarşi.

**Düzeltme (dar diff):** yalnızca `FoodExplore.tsx` + `mart-food.styles.ts` (+ bu not). Market tab / AppHeader adres pin dokunulmadı.

| Önce | Sonra |
|------|--------|
| Emoji 2×4 mutfak kareleri | Yatay cuisine chip (Market chip → Market tab) |
| Promo + emoji sağ panel + dots | Tek ink banner + flame CTA (emoji yok) |
| Redeem rail + grocery Flash Sale | Kaldırıldı (Market dikeyine ait) |
| Cream paper / lime deal | Theme `paper`/`mist` · deal = flame |
| Cover sabit 140px | ~16:9 cover; ★·ETA·fee tek satır |

Kanıt: `.rea-refs/screenshots/kullo-food-fixed.png`, `kullo-food-fixed-mid.png`.

---

## Offline demo (2026-11-05)

**Hedef:** Ağ yokken (airplane / wifi+data off) Mart Food + Market seed veri ve görseller görünür kalsın; Unsplash / Migros CDN kırılmasın.

| Katman | Strateji |
|--------|----------|
| Veri | `marketplace-store` `kullo.marketplace_offline_v5` + `DEMO_RESTAURANTS` / grocery `martCatalog` — network’siz seed; boş spinner yok |
| Food görseller | `assets/offline/food/*` bundled Unsplash id map → `lib/offline-image-map.ts` · `OfflineCover`/`OfflineImage` = **RN Image** + local require + brand/mist placeholder |
| Ana / araç | `assets/offline/cars/*` + `assets/offline/home/*` → aynı map (`HOME_BY_PHOTO`) · VehicleCard/SuperHomeFeed `OfflineCover` · Ana logo local `kullo-lockup-latin.png` |
| Market görseller | `assets/offline/mart/*` Migros URL map · `M()` / `U()` resolve · `OfflineImage` (MarketHome) |
| Ekranlar | Food hub / list / store / flowers / order-again; Market Flash + aisles + buy-again |

Kanıt: `.rea-refs/screenshots/kullo-offline-food.png`, `kullo-offline-market.png`, `kullo-offline-home.png`.
