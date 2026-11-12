# Kullo Partner

Ayrı Android/iOS uygulaması — Merchant + Sürücü (MVP: yemek mutfak + taksi).

- Package: `com.berqenas.kullo.partner`
- Scheme: `kullopartner://`
- Tüketici süper-app (`apps/mobile`) bundan bağımsızdır.

```bash
pnpm install
cd apps/partner
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```
