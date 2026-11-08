# Super Home — iBazzar referansı

Kaynak: `net.ibazzar.ibazzar` v3.5.24 (Flutter, APK `base` + `arm64` split).  
Cihaz: `6544bc4b`. Kanıt: `.rea-refs/apks/ibazzar*.apk`, `.rea-refs/screenshots/ibazzar-home-*.png`.

## Motor

- Flutter AOT (`libapp.so` / `libflutter.so` in `split_config.arm64_v8a.apk`)
- Snapshot hash: `ace654289f5abc240509fc941453ebc5`
- MainActivity: `net.ibazzar.ibazzar.MainActivity`

## Ana ekran IA (üst → alt)

| Bölüm | iBazzar | Kullo eşlemesi |
| --- | --- | --- |
| **AppBar zemin** | Soft rose/pink gradient + diagonal pattern | Soft peach (`#F7DDE3` / `flameSoft`); `AppHeader variant="market"` |
| **Marka satırı** | (logo yok; hub kartlarında marka) | Kullo wordmark + adres pin + IQD + dil |
| **Dikey hub kartları** | `ibazzar` (kırmızı aktif) · motors · real estate · marketplace | `kullo` (flame aktif) · motors · emlak · mart |
| **Arama** | Geniş beyaz rounded search + sağda bell | Aynı yerleşim; `aboveSearch` = hub, `below` = pills |
| **Adres** | (yok / ayrı) | AppHeader pin — davranış korunur (Mart/Cars brand header etkilenmez) |
| **Kategori pill rail** | For you (siyah aktif) · Books · Electronics · Men… | Senin için · Araç al · Emlak · Kullo Mart · Moda |
| **Promo banner** | (feed içinde) | “Fırsatlar” hero strip |
| **Dairesel kategori rail** | Shoes / Watches / Bags / Books / Kitchen (foto daire) | Araç / Emlak / Mart / Yemek / Hizmetler |
| **2×2 görsel grid** | Women · Men · Perfumes · Kids | Araç · Emlak · Mart · Moda |
| **Feed bölümleri** | “Fashion Under…”, “Fashion Deals…” + See All (mavi) | Sana özel → Araç / Emlak / Mart rayları + Tümünü Gör |
| **Bottom nav** | Home · Categories · Discounts · My Cart · Profile | **Kullo mevcut:** Ana · Ara · İlan Ver · Mağazalar · Hesap (Cars/Mart shell bozulmasın diye değiştirilmedi) |

## Bottom nav notu

iBazzar sepet + indirim odaklı e-ticaret nav’ı kullanır. Kullo süper-app nav’ı (sell FAB, stores, cars/mart alt kabukları) farklıdır; home IA parity üst gövdede, tab bar’da değil.

## Proof

- `.rea-refs/screenshots/COMPARE-ibazzar-home.png`
- `.rea-refs/screenshots/COMPARE-kullo-home.png`
