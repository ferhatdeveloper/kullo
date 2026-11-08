/**
 * Kullo Mart — Market tab (birebir M10 Home.jsx port)
 * Assets: assets/mart-clone + Migros CDN demo
 * MARKER: market-ink-heavy-2026-11-05 CONTRAST-FIX-2026-11-05b
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Snowflake, Zap } from 'lucide-react-native'
import SoftPress from './SoftPress'
import AddToCartButton from './AddToCartButton'
import OfflineImage from './OfflineImage'
import { AppHeader } from '../brand'
import { useTranslation } from 'react-i18next'
import { formatIQD } from '../../lib/mart-format'
import { useMartCartStore } from '../../lib/mart-cart-store'
import { nescafeBannerImg } from './mart-images'
import { colors } from './mart-theme'
import {
  BANETTI_PRODUCTS,
  BEVERAGES,
  BEST_SELLERS,
  BRANDS,
  BUY_AGAIN,
  CATEGORIES,
  CATEGORIES_PAGE2,
  CLEANING,
  DAIRY,
  EXPLORE,
  LOGO_BRANDS,
  NESCAFE_ROW,
  PROMOS,
  SNACKS,
  TOP_SAVERS,
  WORLD,
  banettiBannerImg,
  freshProduceBannerImg,
} from '../../lib/martCatalog'

const { width: W } = Dimensions.get('window')
const PAD = 16
const GAP = 10

/** Market palette — ink ağır + flame aksan. MARKER: market-ink-heavy-2026-11-05 */
const C = {
  bg: colors.card,
  ink: colors.ink,
  muted: colors.muted,
  soft: colors.bg,
  line: colors.line,
  cream: colors.flameSoft,
  orange: colors.flame,
  red: colors.flame,
  flame: colors.flame,
  flameDeep: colors.flameDeep,
  flameSoft: colors.flameSoft,
  mist: colors.mist,
}

const label = (p, lang) => p.names?.[lang] || p.names?.en || p.name || ''

function AddBtn({ onPress, size = 32 }) {
  return <AddToCartButton onPress={onPress} size={size} color={C.ink} />
}

function SectionTitle({ title, action, onAction }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, marginBottom: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink, letterSpacing: -0.2 }}>{title}</Text>
      {action ? (
        <SoftPress onPress={onAction}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: C.ink,
              textDecorationLine: 'underline',
              textDecorationColor: C.flame,
            }}
          >
            {action}
          </Text>
        </SoftPress>
      ) : null}
    </View>
  )
}

/** Flash Sale — ink blok (ağır) + flame zap/timer aksan */
function FlashSaleBlock({ title, endsInLabel, secondsLeft, isRTL, onPress, products, lang, onAdd }) {
  const h = Math.floor(secondsLeft / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  const s = secondsLeft % 60
  const pad = (n) => String(n).padStart(2, '0')
  const cells = [pad(h), pad(m), pad(s)]
  return (
    <View
      style={{
        marginHorizontal: PAD,
        marginTop: 10,
        marginBottom: 4,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: C.ink,
        borderWidth: 2,
        borderColor: C.ink,
      }}
    >
      <SoftPress
        onPress={onPress}
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 12,
          gap: 10,
          borderBottomWidth: 2,
          borderBottomColor: 'rgba(255,255,255,0.18)',
          backgroundColor: C.ink,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            backgroundColor: C.flame,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: '-6deg' }],
            borderWidth: 2,
            borderColor: C.flameDeep,
          }}
        >
          <Zap size={18} color="#fff" fill="#fff" strokeWidth={2.6} />
        </View>
        <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text
            style={{
              color: '#fff',
              fontWeight: '900',
              fontSize: 17,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 11, marginTop: 2 }}>
            {endsInLabel}
          </Text>
        </View>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 2 }}>
          {cells.map((cell, i) => (
            <View key={`${i}-${cell}`} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 2 }}>
              {i > 0 ? <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>:</Text> : null}
              <View
                style={{
                  minWidth: 28,
                  paddingHorizontal: 4,
                  paddingVertical: 5,
                  backgroundColor: C.flame,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13, fontVariant: ['tabular-nums'] }}>{cell}</Text>
              </View>
            </View>
          ))}
        </View>
      </SoftPress>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 12, paddingBottom: 14 }}
      >
        {products.map((p, i) => {
          const w = 104
          const imgH = Math.round(w * 0.78)
          return (
            <View
              key={`flash-${p.id}-${i}`}
              style={{
                width: w,
                marginRight: 12,
                borderRadius: 16,
                backgroundColor: '#fff',
                overflow: 'hidden',
              }}
            >
              <View style={{ width: w, height: imgH, backgroundColor: '#fff', overflow: 'hidden' }}>
                <OfflineImage source={p.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                {p.save ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: C.flame,
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 3,
                      zIndex: 2,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff' }}>Save {p.save}%</Text>
                  </View>
                ) : null}
                <View style={{ position: 'absolute', right: 8, bottom: 8 }}>
                  <AddBtn onPress={() => onAdd(p)} size={28} />
                </View>
              </View>
              <View style={{ paddingHorizontal: 8, paddingTop: 6, paddingBottom: 8, backgroundColor: '#fff' }}>
                <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: '700', color: C.ink, lineHeight: 15, minHeight: 30 }}>
                  {label(p, lang)}
                </Text>
                <Text style={{ marginTop: 2, fontSize: 13, fontWeight: '900', color: C.ink }}>
                  {formatIQD(p.price, lang)}
                </Text>
                {p.old ? (
                  <Text style={{ fontSize: 10, color: C.muted, textDecorationLine: 'line-through', marginTop: 1 }}>
                    {formatIQD(p.old, lang)}
                  </Text>
                ) : null}
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

/** Flash Sale altı marka kartları — Nada/Puck: hazır kart; diğerleri eski kırmızı alt */
function BrandCard({ item, w, h, onPress }) {
  if (item.card) {
    return (
      <SoftPress
        onPress={onPress}
        style={{ width: w, height: h, marginRight: GAP, borderRadius: 20, overflow: 'hidden', backgroundColor: C.cream }}
      >
        <OfflineImage source={item.card} style={{ width: w, height: h }} resizeMode="cover" />
      </SoftPress>
    )
  }

  const imgW = Math.round(w * 0.9)
  const imgH = Math.round(h * 0.7)
  return (
    <SoftPress
      onPress={onPress}
      style={{ width: w, height: h, marginRight: GAP, borderRadius: 20, overflow: 'hidden', backgroundColor: C.cream }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 44,
          backgroundColor: C.flame,
          borderTopLeftRadius: 42,
          borderTopRightRadius: 42,
          zIndex: 1,
        }}
      />
      <Text style={{ position: 'absolute', top: 14, left: 14, zIndex: 3, fontSize: 17, fontWeight: '800', color: C.ink }}>
        {item.name}
      </Text>
      {/* Explicit w/h + contain — absolute left/right kırpmayı bozuyordu */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 42,
          bottom: 8,
          zIndex: 2,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <OfflineImage source={item.image} style={{ width: imgW, height: imgH }} resizeMode="contain" />
      </View>
      <View
        style={{
          position: 'absolute',
          right: 14,
          top: h * 0.42,
          width: 9,
          height: 9,
          backgroundColor: C.flameDeep,
          transform: [{ rotate: '45deg' }],
          zIndex: 3,
        }}
      />
    </SoftPress>
  )
}

/** Talabat “deal cards” — dikey promo şeridi (pro / hot deals / marka) */
function DealPromoCard({ title, onPress, children, bottomColor, wave }) {
  const w = 148
  const h = 200
  return (
    <SoftPress
      onPress={onPress}
      style={{
        width: w,
        height: h,
        marginRight: 12,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: C.cream,
      }}
    >
      <Text
        numberOfLines={2}
        style={{
          position: 'absolute',
          top: 14,
          left: 12,
          right: 12,
          zIndex: 3,
          fontSize: 17,
          fontWeight: '900',
          color: C.ink,
          lineHeight: 20,
        }}
      >
        {title}
      </Text>
      {children}
      {wave ? (
        <View
          style={{
            position: 'absolute',
            left: -20,
            right: -20,
            bottom: -8,
            height: 78,
            backgroundColor: bottomColor,
            borderTopLeftRadius: 90,
            borderTopRightRadius: 90,
          }}
        />
      ) : (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 72,
            backgroundColor: bottomColor,
          }}
        />
      )}
    </SoftPress>
  )
}

function DealPromoStrip({ onPress, lang }) {
  const kinderImg = BRANDS.find((b) => b.id === 'kinder')?.image
  const maggiImg = BRANDS.find((b) => b.id === 'maggi')?.image
  const titles = {
    pro: lang === 'tr' ? 'Sadece Kullo’da' : lang === 'ar' ? 'فقط في Kullo' : 'Only on Kullo',
    hot: lang === 'tr' ? 'İndirim %30’a var' : lang === 'ar' ? 'خصم حتى 30٪' : 'Up to 30% off',
    brand: 'Kinder',
    maggi: 'Maggi',
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 2 }}
    >
      <DealPromoCard title={titles.pro} onPress={onPress} bottomColor={C.flame} wave={false}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 72,
            backgroundColor: C.flameSoft,
          }}
        />
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            top: 58,
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: C.flame,
            borderWidth: 3,
            borderColor: C.flame,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            transform: [{ rotate: '-6deg' }],
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff', textAlign: 'center' }}>Up to</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 1 }}>50% off</Text>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 18,
            alignSelf: 'center',
            zIndex: 3,
            backgroundColor: 'rgba(255,255,255,0.95)',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: C.ink }}>
            {lang === 'tr' ? 'özel fırsatlar' : lang === 'ar' ? 'عروض خاصة' : 'pro offers'}
          </Text>
        </View>
      </DealPromoCard>

      <DealPromoCard title={titles.hot} onPress={onPress} bottomColor={C.flame} wave>
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            top: 70,
            zIndex: 2,
            backgroundColor: '#fff',
            borderWidth: 2.5,
            borderColor: C.flame,
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 12,
            transform: [{ rotate: '4deg' }],
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '900', color: C.ink }}>Hot Deals</Text>
        </View>
        <View
          style={{
            position: 'absolute',
            top: 62,
            right: 22,
            width: 8,
            height: 8,
            backgroundColor: C.flameDeep,
            transform: [{ rotate: '45deg' }],
            zIndex: 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 118,
            left: 18,
            width: 6,
            height: 6,
            backgroundColor: C.flame,
            transform: [{ rotate: '45deg' }],
            zIndex: 2,
          }}
        />
      </DealPromoCard>

      <DealPromoCard title={titles.brand} onPress={onPress} bottomColor={C.flame} wave>
        {kinderImg ? (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 48,
              bottom: 28,
              zIndex: 2,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <OfflineImage source={kinderImg} style={{ width: 112, height: 112 }} resizeMode="contain" />
          </View>
        ) : null}
        <View
          style={{
            position: 'absolute',
            top: 56,
            right: 16,
            width: 7,
            height: 7,
            backgroundColor: C.orange,
            transform: [{ rotate: '45deg' }],
            zIndex: 3,
          }}
        />
      </DealPromoCard>

      <DealPromoCard title={titles.maggi} onPress={onPress} bottomColor={C.flame} wave>
        {maggiImg ? (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 48,
              bottom: 28,
              zIndex: 2,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <OfflineImage source={maggiImg} style={{ width: 112, height: 112 }} resizeMode="contain" />
          </View>
        ) : null}
      </DealPromoCard>
    </ScrollView>
  )
}

/**
 * Tek slayt promo — NESCAFÉ serisi kalitesinde marka banner’ları
 */
const PROMO_SLIDES = [
  {
    id: 'nescafe',
    kind: 'bleed',
    /** Kullanıcı 4 kutu splash — 1600×606 (800×303 oranı) */
    image: require('../../assets/mart-clone/brand-banners/nescafe-series.jpg'),
    bg: colors.mist,
  },
  {
    id: 'coca-cola',
    kind: 'bleed',
    image: require('../../assets/mart-clone/brand-banners/coca-cola.jpg'),
    bg: colors.mist,
  },
  {
    id: 'pinar',
    kind: 'bleed',
    image: require('../../assets/mart-clone/brand-banners/pinar.jpg'),
    bg: colors.mist,
  },
  {
    id: 'pampers',
    kind: 'bleed',
    image: require('../../assets/mart-clone/brand-banners/pampers.jpg'),
    bg: colors.mist,
  },
  {
    id: 'onlem',
    kind: 'bleed',
    image: require('../../assets/mart-clone/brand-banners/onlem.jpg'),
    bg: colors.mist,
  },
]

function PromoBannerSlider({ onPress, lang = 'tr' }) {
  const [page, setPage] = useState(0)
  const scrollRef = useRef(null)
  const pageRef = useRef(0)
  const bannerW = W - PAD * 2
  /** Tüm slaytlar 1600×606 — çerçeveye bire bir oturur */
  const bannerH = Math.round(bannerW * (606 / 1600))

  useEffect(() => {
    const id = setInterval(() => {
      const next = (pageRef.current + 1) % PROMO_SLIDES.length
      pageRef.current = next
      setPage(next)
      scrollRef.current?.scrollTo({ x: next * W, animated: true })
    }, 4200)
    return () => clearInterval(id)
  }, [])

  return (
    <View style={{ marginTop: 16 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const next = Math.round(e.nativeEvent.contentOffset.x / W)
          pageRef.current = next
          setPage(next)
        }}
      >
        {PROMO_SLIDES.map((item) => {
          const title = item.title?.[lang] || item.title?.en || item.title
          const sub = item.sub?.[lang] || item.sub?.en || item.sub
          const ink = item.light ? '#fff' : C.ink
          const muted = item.light ? 'rgba(255,255,255,0.85)' : C.muted
          return (
            <View key={item.id} style={{ width: W, paddingHorizontal: PAD }}>
              <SoftPress
                onPress={onPress}
                style={{
                  width: bannerW,
                  height: bannerH,
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: item.bg,
                  position: 'relative',
                }}
              >
                {item.kind === 'bleed' ? (
                  <OfflineImage
                    source={item.image}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: bannerW,
                      height: bannerH,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1, paddingLeft: 16, paddingRight: 6, justifyContent: 'center' }}>
                      <View
                        style={{
                          alignSelf: 'flex-start',
                          width: 28,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: item.accent,
                          marginBottom: 8,
                        }}
                      />
                      <Text style={{ fontSize: 18, fontWeight: '900', color: ink, letterSpacing: -0.3 }} numberOfLines={2}>
                        {title}
                      </Text>
                      <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '700', color: muted }} numberOfLines={1}>
                        {sub}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: bannerW * 0.5,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: 10,
                        gap: 4,
                      }}
                    >
                      {(item.images || []).slice(0, 2).map((img, i) => (
                        <OfflineImage
                          key={`${item.id}-img-${i}`}
                          source={img}
                          style={{ width: '46%', height: '78%' }}
                          resizeMode="contain"
                        />
                      ))}
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 8,
                        backgroundColor: item.accent,
                        opacity: item.light ? 0.35 : 1,
                      }}
                    />
                  </View>
                )}
              </SoftPress>
            </View>
          )
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 6 }}>
        {PROMO_SLIDES.map((item, i) => (
          <View
            key={`promo-dot-${item.id}`}
            style={{
              width: i === page ? 16 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === page ? C.flame : C.line,
            }}
          />
        ))}
      </View>
    </View>
  )
}

/**
 * embedMeta: fiyat/ad beyaz kartın içinde (Flash ink zemin üzerinde okunabilirlik).
 * onDark: metin kart dışında koyu zeminde → white / flameSoft.
 */
function ProductChip({
  product,
  lang,
  onAdd,
  width = 118,
  showSave,
  tileBg,
  inkOnLight,
  onDark,
  embedMeta,
  saveStrong,
  labelColor,
  priceColor,
}) {
  const onInk = onDark || inkOnLight === false
  const nameColor = labelColor || (onInk ? '#fff' : C.ink)
  const moneyColor = priceColor || (onInk ? '#fff' : C.ink)
  const oldColor = onInk ? 'rgba(255,255,255,0.7)' : C.muted
  const imgH = embedMeta ? Math.round(width * 0.78) : width
  const bg = tileBg === undefined ? C.soft : tileBg

  const saveBadge = showSave && product.save ? (
    <View
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: saveStrong ? C.flame : C.flameSoft,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderWidth: saveStrong ? 0 : 1.5,
        borderColor: C.flame,
        zIndex: 2,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '900', color: saveStrong ? '#fff' : C.flameDeep }}>
        Save {product.save}%
      </Text>
    </View>
  ) : null

  if (embedMeta) {
    return (
      <View
        style={{
          width,
          marginRight: 12,
          borderRadius: 16,
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}
      >
        <View style={{ width, height: imgH, backgroundColor: bg === 'transparent' ? '#fff' : bg, overflow: 'hidden' }}>
          <OfflineImage source={product.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          {saveBadge}
          <View style={{ position: 'absolute', right: 8, bottom: 8 }}>
            <AddBtn onPress={onAdd} size={28} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 8, paddingTop: 6, paddingBottom: 8 }}>
          <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: '700', color: C.ink, lineHeight: 15, minHeight: 30 }}>
            {label(product, lang)}
          </Text>
          <Text style={{ marginTop: 2, fontSize: 13, fontWeight: '900', color: C.ink }}>
            {formatIQD(product.price, lang)}
          </Text>
          {product.old ? (
            <Text style={{ fontSize: 10, color: C.muted, textDecorationLine: 'line-through', marginTop: 1 }}>
              {formatIQD(product.old, lang)}
            </Text>
          ) : null}
        </View>
      </View>
    )
  }

  return (
    <View style={{ width, marginRight: 12 }}>
      <View
        style={{
          width,
          height: imgH,
          borderRadius: 16,
          backgroundColor: bg,
          overflow: 'hidden',
        }}
      >
        <OfflineImage source={product.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        {saveBadge}
        <View style={{ position: 'absolute', right: 8, bottom: 8 }}>
          <AddBtn onPress={onAdd} size={30} />
        </View>
      </View>
      <Text numberOfLines={2} style={{ marginTop: 8, fontSize: 13, fontWeight: '700', color: nameColor, lineHeight: 17, minHeight: 34 }}>
        {label(product, lang)}
      </Text>
      <Text style={{ marginTop: 2, fontSize: 14, fontWeight: '800', color: moneyColor }}>{formatIQD(product.price, lang)}</Text>
      {product.old ? (
        <Text style={{ fontSize: 11, color: oldColor, textDecorationLine: 'line-through' }}>{formatIQD(product.old, lang)}</Text>
      ) : null}
    </View>
  )
}

function ProductRow({ title, action, onAction, products, lang, onAdd, showSave }) {
  return (
    <View style={{ marginTop: 22 }}>
      <SectionTitle title={title} action={action} onAction={onAction} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: PAD }}>
        {products.map((p, i) => (
          <ProductChip key={`${p.id}-${i}`} product={p} lang={lang} onAdd={() => onAdd(p)} showSave={showSave} />
        ))}
      </ScrollView>
    </View>
  )
}

/** Talabat-style category tile: 3 ürün kolajı — beyaz zemin (Migros beyaz arka planıyla kaynansın) */
function CategoryTile({ item, size, lang, onPress }) {
  const imgs = item.images?.length ? item.images : [item.image]
  const pad = 4
  return (
    <SoftPress onPress={onPress} style={{ width: size, alignItems: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#EEEEEE',
        }}
      >
        {imgs.length >= 3 ? (
          <View style={{ flex: 1, flexDirection: 'row', padding: pad }}>
            <View style={{ flex: 1.2, marginRight: 2, justifyContent: 'center' }}>
              <OfflineImage source={imgs[0]} style={{ width: '100%', height: '92%' }} resizeMode="contain" />
            </View>
            <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 2 }}>
              <OfflineImage source={imgs[1]} style={{ width: '100%', height: '48%' }} resizeMode="contain" />
              <OfflineImage source={imgs[2]} style={{ width: '100%', height: '48%' }} resizeMode="contain" />
            </View>
          </View>
        ) : (
          <OfflineImage source={imgs[0]} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        )}
        {item.snow ? (
          <View style={{ position: 'absolute', top: 6, right: 6 }}>
            <Snowflake size={13} color={C.ink} fill={C.orange} />
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={2}
        style={{
          marginTop: 6,
          fontSize: 11,
          fontWeight: '700',
          color: C.ink,
          textAlign: 'center',
          lineHeight: 14,
          minHeight: 28,
        }}
      >
        {label(item, lang)}
      </Text>
    </SoftPress>
  )
}

/** 3×3 paging grid + bottom dots (daha büyük kategori görselleri) */
function CategoryPager({ pages, lang, onPress }) {
  const [page, setPage] = useState(0)
  const pageW = W
  const cols = 3
  const tile = Math.floor((W - PAD * 2 - GAP * (cols - 1)) / cols)
  const rowH = tile + 38
  const gridH = rowH * 3 + 4

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x
          setPage(Math.round(x / pageW))
        }}
      >
        {pages.map((cats, pi) => (
          <View key={`catpage-${pi}`} style={{ width: pageW, paddingHorizontal: PAD }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, minHeight: gridH }}>
              {cats.map((c) => (
                <CategoryTile key={c.id} item={c} size={tile} lang={lang} onPress={onPress} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 6 }}>
        {pages.map((_, i) => (
          <View
            key={`catdot-${i}`}
            style={{
              width: i === page ? 16 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === page ? C.flame : C.line,
            }}
          />
        ))}
      </View>
    </View>
  )
}

export default function MarketHome({ onGoCart, onGoAccount }) {
  const insets = useSafeAreaInsets()
  const { t: ti18n, i18n } = useTranslation()
  const lang = (i18n.language || 'tr').slice(0, 2)
  const isRTL = i18n.dir() === 'rtl'
  const t = (key, opts) => {
    if (key === 'searchPlaceholder' || key === 'search') return ti18n('mart.searchPlaceholder')
    if (key === 'addMore') return ti18n('mart.minOrderRemain', { amount: opts?.n })
    return ti18n(key, opts)
  }
  const addLine = useMartCartStore((s) => s.add)
  const lines = useMartCartStore((s) => s.lines)
  const cartCount = lines.reduce((n, l) => n + l.qty, 0)
  const cartTotal = lines.reduce((s, l) => s + l.unitPriceIqd * l.qty, 0)
  const minOrder = 15000
  const remain = minOrder > 0 ? Math.max(0, minOrder - (cartTotal || 0)) : 0

  /** Flash sale geri sayım — her açılışta ~2 saat (demo) */
  const [flashLeft, setFlashLeft] = useState(2 * 60 * 60 + 14 * 60 + 37)
  useEffect(() => {
    const id = setInterval(() => setFlashLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])

  const cartPulse = useRef(new Animated.Value(1)).current
  const cartBadgePulse = useRef(new Animated.Value(1)).current
  const prevCartCount = useRef(cartCount)
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      cartPulse.setValue(1)
      cartBadgePulse.setValue(1)
      Animated.parallel([
        Animated.sequence([
          Animated.spring(cartPulse, { toValue: 1.06, friction: 3, tension: 220, useNativeDriver: true }),
          Animated.spring(cartPulse, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.spring(cartBadgePulse, { toValue: 1.45, friction: 3, tension: 240, useNativeDriver: true }),
          Animated.spring(cartBadgePulse, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }),
        ]),
      ]).start()
    }
    prevCartCount.current = cartCount
  }, [cartCount, cartPulse, cartBadgePulse])

  const brandW = 148
  const brandH = 200
  const logoTile = Math.floor((W - PAD * 2 - GAP * 3) / 4) // 4 sütun squircle
  const exploreW = Math.floor((W - PAD * 2 - GAP) / 2)
  const categoryPages = useMemo(() => {
    const all = [...CATEGORIES, ...CATEGORIES_PAGE2]
    const size = 9
    const pages = []
    for (let i = 0; i < all.length; i += size) pages.push(all.slice(i, i + size))
    return pages
  }, [])
  const flashProducts = useMemo(() => TOP_SAVERS.slice(0, 8), [])

  const goStore = () => {}
  const goSearch = () => {}
  const goCart = () => onGoCart?.()
  const onAdd = (p) => {
    if (!p?.id) return
    const img = typeof p.image === 'string' ? p.image : p.image?.uri
    const name = p.names?.tr || p.names?.en || p.name || p.id
    void addLine({
      productId: p.id,
      name,
      unitPriceIqd: p.price,
      imageUri: typeof img === 'string' ? img : undefined,
      aisle: 'produce',
    })
  }

  const L = {
    viewAll: lang === 'tr' ? 'Tümü' : lang === 'ar' ? 'عرض الكل' : 'View all',
    buyAgain: lang === 'tr' ? 'Tekrar al' : lang === 'ar' ? 'اشترِ مجدداً' : 'Buy again',
    best:
      lang === 'tr'
        ? 'Taze sebze & meyve'
        : lang === 'ar'
          ? 'خضار وفواكه طازجة'
          : 'Fresh fruit & veg',
    shopCat: lang === 'tr' ? 'Kategoriye göre alışveriş' : lang === 'ar' ? 'تسوّق حسب القسم' : 'Shop by category',
    shopBrand: lang === 'tr' ? 'Markaya göre alışveriş' : lang === 'ar' ? 'تسوّق حسب العلامة' : 'Shop by brand',
    world: lang === 'tr' ? 'Dünyadan lezzetler' : lang === 'ar' ? 'من حول العالم' : 'Around the world',
    savers: lang === 'tr' ? 'En iyi fırsatlar' : lang === 'ar' ? 'أفضل العروض' : 'Top savers',
    dairy: lang === 'tr' ? 'Süt ve yumurta' : lang === 'ar' ? 'ألبان وبيض' : 'Dairy & eggs',
    snacks: lang === 'tr' ? 'Atıştırmalıklar' : lang === 'ar' ? 'سناكات' : 'Snacks',
    drinks: lang === 'tr' ? 'İçecekler' : lang === 'ar' ? 'مشروبات' : 'Beverages',
    clean: lang === 'tr' ? 'Temizlik' : lang === 'ar' ? 'منظفات' : 'Care & clean',
    nescafe: 'NESCAFÉ',
    explore: lang === 'tr' ? "Market'i keşfet" : lang === 'ar' ? 'استكشف Market' : 'Explore Market',
    viewCart: lang === 'tr' ? 'Sepeti gör' : lang === 'ar' ? 'عرض السلة' : 'View cart',
    yourCart: lang === 'tr' ? 'Sepetin' : lang === 'ar' ? 'سلتك' : 'Your cart',
    flashSale: lang === 'tr' ? 'Flash Sale' : lang === 'ar' ? 'عروض سريعة' : 'Flash sale',
    endsIn: lang === 'tr' ? 'Bitiş' : lang === 'ar' ? 'ينتهي خلال' : 'Ends in',
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader
        variant="market"
        showBack
        searchPlaceholder={t('searchPlaceholder') || t('search') || L.explore}
        onSearchPress={goSearch}
        onBackPress={() => router.replace('/(tabs)')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 + insets.bottom }}>
        <FlashSaleBlock
          title={L.flashSale}
          endsInLabel={L.endsIn}
          secondsLeft={flashLeft}
          isRTL={isRTL}
          onPress={goStore}
          products={flashProducts}
          lang={lang}
          onAdd={onAdd}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 8 }}>
          {BRANDS.map((b) => (
            <BrandCard key={b.id} item={b} w={brandW} h={brandH} onPress={goStore} />
          ))}
        </ScrollView>

        <ProductRow title={L.buyAgain} action={L.viewAll} onAction={goStore} products={BUY_AGAIN} lang={lang} onAdd={onAdd} />

        {/* Talabat Shop by category — 3×4 + sayfa göstergesi */}
        <View style={{ marginTop: 22 }}>
          <SectionTitle title={L.shopCat} />
          <CategoryPager pages={categoryPages} lang={lang} onPress={goStore} />
        </View>

        {/* Talabat deal cards — kategori altına kaydırılabilir dikey promo */}
        <DealPromoStrip onPress={goStore} lang={lang} />

        {/* Ekmek / Head&Shoulders — tek kayan banner */}
        <PromoBannerSlider onPress={goStore} lang={lang} />

        {/* Shop by brand — Talabat bire bir: 2×4 squircle logo grid */}
        <View style={{ marginTop: 18 }}>
          <SectionTitle title={L.shopBrand} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PAD, gap: GAP }}>
            {LOGO_BRANDS.map((b) => (
              <SoftPress
                key={b.id}
                onPress={goStore}
                style={{
                  width: logoTile,
                  height: logoTile,
                  borderRadius: 22,
                  backgroundColor: b.color || '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <OfflineImage
                  source={b.image}
                  style={
                    b.fill
                      ? { width: '100%', height: '100%' }
                      : { width: '72%', height: '72%' }
                  }
                  resizeMode={b.fill ? 'cover' : 'contain'}
                />
              </SoftPress>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 22 }}>
          <SectionTitle title={L.world} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: PAD }}>
            {WORLD.map((w) => (
              <SoftPress key={w.id} onPress={goStore} style={{ alignItems: 'center', marginRight: 16, width: 84 }}>
                <View
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 22,
                    backgroundColor: w.bg || '#fff',
                    overflow: 'hidden',
                  }}
                >
                  <OfflineImage source={w.flagImg} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>
                <Text style={{ marginTop: 6, fontSize: 12, fontWeight: '700', color: C.ink }}>{label(w, lang)}</Text>
              </SoftPress>
            ))}
          </ScrollView>
        </View>

        {/* Taze sebze & meyve — banner + ürün şeridi */}
        <View style={{ marginTop: 22 }}>
          <SoftPress
            onPress={goStore}
            style={{
              marginHorizontal: PAD,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: C.mist,
            }}
          >
            <OfflineImage
              source={freshProduceBannerImg}
              style={{
                width: W - PAD * 2,
                height: Math.round((W - PAD * 2) * (606 / 1600)),
              }}
              resizeMode="stretch"
            />
          </SoftPress>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 12 }}
          >
            {BEST_SELLERS.map((p, i) => (
              <ProductChip
                key={`fresh-${p.id}-${i}`}
                product={p}
                lang={lang}
                onAdd={() => onAdd(p)}
                width={118}
                tileBg="#FFFFFF"
              />
            ))}
          </ScrollView>
        </View>

        {/* NESCAFÉ — banner + ürün şeridi */}
        <View style={{ marginTop: 22 }}>
          <SoftPress
            onPress={goStore}
            style={{
              marginHorizontal: PAD,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: C.mist,
            }}
          >
            <OfflineImage
              source={nescafeBannerImg}
              style={{
                width: W - PAD * 2,
                height: Math.round((W - PAD * 2) * (606 / 1600)),
              }}
              resizeMode="stretch"
            />
          </SoftPress>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 12 }}
          >
            {NESCAFE_ROW.map((p, i) => (
              <ProductChip key={`nescafe-${p.id}-${i}`} product={p} lang={lang} onAdd={() => onAdd(p)} width={118} />
            ))}
          </ScrollView>
        </View>

        {/* Banetti — NESCAFÉ bire bir: banner + ürün şeridi */}
        <View style={{ marginTop: 22 }}>
          <SoftPress
            onPress={goStore}
            style={{
              marginHorizontal: PAD,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: C.mist,
            }}
          >
            <OfflineImage
              source={banettiBannerImg}
              style={{
                width: W - PAD * 2,
                height: Math.round((W - PAD * 2) * (606 / 1600)),
              }}
              resizeMode="stretch"
            />
          </SoftPress>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: PAD, paddingTop: 12 }}
          >
            {BANETTI_PRODUCTS.map((p, i) => (
              <ProductChip
                key={`banetti-${p.id}-${i}`}
                product={p}
                lang={lang}
                onAdd={() => onAdd(p)}
                width={118}
                tileBg="#FFFFFF"
              />
            ))}
          </ScrollView>
        </View>

        <ProductRow title={L.savers} action={L.viewAll} onAction={goStore} products={TOP_SAVERS} lang={lang} onAdd={onAdd} showSave />

        <SoftPress onPress={goStore} style={{ marginHorizontal: PAD, marginTop: 22, height: 120, borderRadius: 16, overflow: 'hidden', backgroundColor: C.ink }}>
          <OfflineImage source={PROMOS[1].image} style={{ position: 'absolute', right: 0, bottom: 0, width: 150, height: 120 }} resizeMode="contain" />
          <View style={{ flex: 1, justifyContent: 'center', padding: 16, maxWidth: '58%' }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{PROMOS[1].title}</Text>
            <Text style={{ color: C.flameSoft, fontSize: 12, marginTop: 4 }}>{PROMOS[1].sub}</Text>
          </View>
        </SoftPress>

        <ProductRow title={L.dairy} action={L.viewAll} onAction={goStore} products={DAIRY} lang={lang} onAdd={onAdd} />
        <ProductRow title={L.snacks} action={L.viewAll} onAction={goStore} products={SNACKS} lang={lang} onAdd={onAdd} />

        <SoftPress
          onPress={goStore}
          style={{
            marginHorizontal: PAD,
            marginTop: 22,
            height: 120,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: C.ink,
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#fff' }}>
            <Text style={{ color: C.ink, fontWeight: '900', fontSize: 12 }}>Kullo Mart</Text>
            <Text style={{ color: C.flame, fontWeight: '900', fontSize: 22, marginTop: 4 }}>HOT DEALS</Text>
            <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13, marginTop: 2 }}>{PROMOS[2].sub}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
            <OfflineImage source={PROMOS[2].image} style={{ width: 110, height: 110 }} resizeMode="contain" />
          </View>
        </SoftPress>

        <ProductRow title={L.drinks} action={L.viewAll} onAction={goStore} products={BEVERAGES} lang={lang} onAdd={onAdd} />
        <ProductRow title={L.clean} action={L.viewAll} onAction={goStore} products={CLEANING} lang={lang} onAdd={onAdd} showSave />

        <View style={{ marginTop: 22, marginBottom: 20 }}>
          <SectionTitle title={L.explore} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PAD, justifyContent: 'space-between' }}>
            {EXPLORE.map((p, i) => (
              <View key={`explore-${p.id}-${i}`} style={{ width: exploreW, marginBottom: 14 }}>
                <View style={{ width: exploreW, height: exploreW * 0.85, borderRadius: 16, backgroundColor: C.soft, overflow: 'hidden' }}>
                  <OfflineImage source={p.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  <View style={{ position: 'absolute', right: 10, bottom: 10 }}>
                    <AddBtn onPress={() => onAdd(p)} size={34} />
                  </View>
                </View>
                <Text numberOfLines={2} style={{ marginTop: 8, fontSize: 13, fontWeight: '700', color: C.ink }}>
                  {label(p, lang)}
                </Text>
                <Text style={{ marginTop: 2, fontSize: 14, fontWeight: '800', color: C.ink }}>{formatIQD(p.price, lang)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {cartCount > 0 ? (
        <Animated.View
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: Math.max(insets.bottom, 8) + 72,
            transform: [{ scale: cartPulse }],
          }}
        >
          <SoftPress
            onPress={goCart}
            style={{
              backgroundColor: C.ink,
              borderRadius: 16,
              paddingHorizontal: 10,
              paddingVertical: 10,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              shadowColor: C.ink,
              shadowOpacity: 0.28,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 10,
            }}
          >
            <Animated.View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: 'rgba(0,0,0,0.22)',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: cartBadgePulse }],
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>{cartCount}</Text>
            </Animated.View>
            <Text style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: '800', fontSize: 16 }}>
              {L.viewCart}
            </Text>
            <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end', paddingHorizontal: 4, maxWidth: '38%' }}>
              <Text numberOfLines={1} style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                {formatIQD(cartTotal, lang)}
              </Text>
              {remain > 0 ? (
                <Text numberOfLines={1} style={{ color: 'rgba(255,255,255,0.88)', fontWeight: '600', fontSize: 10, marginTop: 1 }}>
                  {t('addMore', { n: formatIQD(remain, lang) })}
                </Text>
              ) : null}
            </View>
          </SoftPress>
        </Animated.View>
      ) : null}
    </View>
  )
}
