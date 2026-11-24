# Seyyare — `/brag` launch video

20 saniye, 1920×1080 tanıtım videosu (`latent-spaces/brag` + Hyperframes).

## Çıktılar

| Dosya | Açıklama |
|-------|----------|
| `brag.mp4` | Final video (poster frame 0’a gömülü) |
| `brag.jpg` | Paylaşım thumbnail / poster |
| `share-copy.txt` | Sosyal medya metinleri |
| `brag-plan.md` | Kreatif plan |
| `composition-brief.md` | Hyperframes brief |
| `composition/` | Kaynak composition |

## Yeniden üret

```bash
cd brag-output/composition
npx hyperframes check
npx hyperframes render --quality delivery --output ../brag.mp4
```

Müzik: Sascha Ende (ende.app) — CC BY 4.0. SFX: Kenney.nl — CC0.
