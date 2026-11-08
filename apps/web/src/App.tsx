import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  fetchFeaturedVehicles,
  fetchReferenceBrands,
  formatKm,
  formatPrice,
  type Brand,
  type Vehicle,
} from "./api";
import { brandLogoUrl } from "./brand-logos";

const CITIES = ["Erbil", "Baghdad", "Sulaymaniyah", "Basra", "Mosul"] as const;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=2400&q=80";

const BODY_TYPES = [
  {
    id: "suv",
    label: "SUV",
    q: "SUV",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "sedan",
    label: "Sedan",
    q: "Sedan",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "hatch",
    label: "Hatchback",
    q: "Hatchback",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "pickup",
    label: "Pickup",
    q: "Pickup",
    image:
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "hybrid",
    label: "Hibrit",
    q: "Hibrit",
    image:
      "https://images.unsplash.com/photo-1593941707881-a5cfde87040b?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "ev",
    label: "Elektrik",
    q: "Elektrik",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=700&q=80",
  },
] as const;

const LIFESTYLE = [
  { id: "family", label: "Aile araçları", q: "SUV" },
  { id: "luxury", label: "Lüks", q: "Mercedes" },
  { id: "cheap", label: "Uygun fiyat", q: "" },
  { id: "lowkm", label: "Az km", q: "" },
  { id: "private", label: "Bireysel satıcı", q: "" },
  { id: "offroad", label: "Off-road", q: "Pickup" },
  { id: "sport", label: "Sport", q: "Coupe" },
  { id: "commercial", label: "Ticari", q: "Van" },
] as const;

const BUDGETS = [
  { max: 10_000_000, label: "10M altı" },
  { max: 25_000_000, label: "25M altı" },
  { max: 50_000_000, label: "50M altı" },
  { max: 100_000_000, label: "100M altı" },
] as const;

const SERVICES = [
  { id: "taxi", label: "Taksi", desc: "Anında yolculuk", href: "#services" },
  { id: "rent", label: "Kiralama", desc: "Günlük / aylık", href: "#rentals" },
  { id: "auction", label: "Müzayede", desc: "Canlı teklif", href: "#auctions" },
  { id: "wallet", label: "Cüzdan", desc: "Hatwan / IQD", href: "#wallet" },
  { id: "wash", label: "Yıkama", desc: "Mobil servis", href: "#services" },
  { id: "shared", label: "Paylaşımlı", desc: "Şehirler arası", href: "#services" },
  { id: "boost", label: "Boost", desc: "İlan öne çıkar", href: "#sell" },
  { id: "guide", label: "Rehber", desc: "Alım ipuçları", href: "#why" },
] as const;

const WHY = [
  {
    title: "En geniş seçim",
    text: "Irak genelinde ikinci el, kiralama ve yolculuk tek platformda.",
  },
  {
    title: "Şeffaf fiyat",
    text: "Doğrudan satıcı ve galeriler — gizli komisyon yok.",
  },
  {
    title: "Güvenilir satıcılar",
    text: "Doğrulanmış galeriler ve hızlı yanıt rozetleri.",
  },
  {
    title: "AI asistan",
    text: "Marka, bütçe ve şehir için anında öneri.",
  },
] as const;

const DEMO_AUCTIONS = [
  {
    id: "a1",
    title: "Toyota Land Cruiser 2021",
    bid: "95.000.000 IQD",
    bids: 18,
    city: "Erbil",
    cover:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "a2",
    title: "BMW X5 2019",
    bid: "62.500.000 IQD",
    bids: 11,
    city: "Baghdad",
    cover:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "a3",
    title: "Mercedes C 200 2020",
    bid: "48.000.000 IQD",
    bids: 9,
    city: "Sulaymaniyah",
    cover:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
  },
] as const;

const DEMO_DEALERS = [
  {
    id: "d1",
    name: "Erbil Auto Gallery",
    city: "Erbil",
    cover:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "d2",
    name: "Baghdad Motors",
    city: "Baghdad",
    cover:
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "d3",
    name: "Kurdistan Cars",
    city: "Sulaymaniyah",
    cover:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "d4",
    name: "Basra Drive",
    city: "Basra",
    cover:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  },
] as const;

type Page = "home" | "privacy" | "terms" | "pricing";

export function App() {
  const [page, setPage] = useState<Page>("home");
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [brandId, setBrandId] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [rows, brandRows] = await Promise.all([
          fetchFeaturedVehicles(48),
          fetchReferenceBrands("tr"),
        ]);
        if (!cancelled) {
          setVehicles(rows);
          setBrands(brandRows);
        }
      } catch {
        if (!cancelled) setError("İlanlar şu an yüklenemedi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalLabel = useMemo(() => {
    if (loading) return "…";
    return vehicles.length.toLocaleString("tr-TR");
  }, [loading, vehicles.length]);

  const featured = useMemo(() => {
    const f = vehicles.filter((v) => v.featured);
    return (f.length > 0 ? f : vehicles).slice(0, 12);
  }, [vehicles]);

  const popularModels = useMemo(() => {
    const map = new Map<
      string,
      { name: string; count: number; cover_url: string | null; price: string }
    >();
    for (const v of vehicles) {
      const name = `${v.make_name ?? ""} ${v.model}`.trim() || v.title_original || v.model;
      if (!name) continue;
      const cur = map.get(name);
      if (cur) {
        cur.count += 1;
        if (!cur.cover_url && v.cover_url) cur.cover_url = v.cover_url;
      } else {
        map.set(name, {
          name,
          count: 1,
          cover_url: v.cover_url,
          price: formatPrice(v.price_amount, v.price_currency),
        });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [vehicles]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (city && (v.city || "").toLowerCase() !== city.toLowerCase()) return false;
      if (brandId != null && v.make_id !== brandId) return false;
      if (maxPrice != null) {
        const n = typeof v.price_amount === "string" ? Number(v.price_amount) : v.price_amount;
        if (Number.isFinite(n) && n > maxPrice) return false;
      }
      if (!needle) return true;
      const hay = `${v.title_original ?? ""} ${v.model} ${v.make_name ?? ""} ${v.city ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [vehicles, q, city, brandId, maxPrice]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goHome = () => {
    setPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const go = (next: Page) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollRail = (dir: -1 | 1) => {
    railRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  const filterTo = (text: string) => {
    setQ(text);
    setBrandId(null);
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const titleOf = (v: Vehicle) =>
    v.title_original || `${v.make_name ?? ""} ${v.model}`.trim() || "İlan";

  if (page === "privacy" || page === "terms") {
    return (
      <LegalPage
        title={page === "privacy" ? "Gizlilik Politikası" : "Kullanım Şartları"}
        onBack={goHome}
        body={
          page === "privacy"
            ? [
                "Seyyare, hesap, ilan ve yolculuk verilerini hizmeti sunmak için işler.",
                "Oturum jetonları cihazda güvenli saklanır.",
                "Soft-launch döneminde veriler demo ortamında tutulabilir.",
              ]
            : [
                "Platform araç ilanı, kiralama ve yolculuk eşleştirmesi için aracılık katmanıdır.",
                "İlan içerikleri satıcı/bayiye aittir.",
                "Demo hesaplar yalnızca test içindir.",
              ]
        }
      />
    );
  }

  if (page === "pricing") {
    return <PricingPage onBack={goHome} onCta={() => go("home")} />;
  }

  return (
    <div className="dc">
      {/* —— White sticky nav (DubiCars) —— */}
      <header className="dc-nav">
        <div className="dc-nav__inner">
          <button type="button" className="dc-nav__brand" onClick={goHome}>
            <img src="/brand/seyyare-mark-light.png" alt="" width={32} height={32} />
            <span>
              seyyare<span>.men</span>
            </span>
          </button>

          <nav className="dc-nav__links" aria-label="Ana menü">
            <a href="#listings">İkinci el</a>
            <a href="#rentals">Kiralama</a>
            <a href="#services">Taksi</a>
            <a href="#auctions">Müzayede</a>
            <a href="#why">Değer biç</a>
            <a href="#sell">Sat</a>
            <button type="button" className="dc-navlink-btn" onClick={() => go("pricing")}>
              Fiyatlandırma
            </button>
          </nav>

          <div className="dc-nav__actions">
            <span className="dc-nav__lang" aria-hidden>
              🇮🇶 TR
            </span>
            <a className="dc-btn dc-btn--outline" href="#sell">
              Aracını sat
            </a>
            <a className="dc-btn dc-btn--soft" href="#app">
              Giriş
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* —— Hero + floating search —— */}
        <section className="dc-hero" aria-label="Seyyare">
          <div className="dc-hero__frame">
            <img className="dc-hero__img" src={HERO_IMAGE} alt="" />
            <div className="dc-hero__veil" />
            <div className="dc-hero__copy">
              <h1>
                Irak araç
                <br />
                <em>pazarı</em>
              </h1>
              <p>Hayalindeki aracı bul — al, kirala, yolculuk et</p>
            </div>

            <div className="dc-search-wrap">
              <form className="dc-search" onSubmit={onSearch}>
                <p className="dc-search__title">Hayalindeki aracı bul</p>
                <div className="dc-search__bar">
                  <span className="dc-search__ico" aria-hidden>
                    ⌕
                  </span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Marka, model veya anahtar kelime"
                    autoComplete="off"
                  />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    aria-label="Şehir"
                  >
                    <option value="">Tüm şehirler</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="dc-search__go">
                    {totalLabel} ilan ara
                  </button>
                </div>
                <div className="dc-search__budgets">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.max}
                      type="button"
                      className={maxPrice === b.max ? "is-on" : ""}
                      onClick={() => {
                        setMaxPrice(maxPrice === b.max ? null : b.max);
                        document
                          .getElementById("listings")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* —— Our top picks —— */}
        <section className="dc-sec" id="picks">
          <div className="dc-sec__head">
            <h2>Öne çıkanlar</h2>
            <a href="#listings">
              Tümünü gör <span aria-hidden>›</span>
            </a>
          </div>
          <div className="dc-rail-wrap">
            <button
              type="button"
              className="dc-rail-btn dc-rail-btn--prev"
              onClick={() => scrollRail(-1)}
              aria-label="Sola"
            >
              ‹
            </button>
            <div className="dc-rail" ref={railRef} role="list">
              {(loading ? Array.from<Vehicle>({ length: 5 }) : featured).map((item, i) =>
                item ? (
                  <article key={item.id} className="dc-card" role="listitem">
                    <div className="dc-card__media">
                      {item.cover_url ? (
                        <img src={item.cover_url} alt="" loading="lazy" />
                      ) : (
                        <div className="dc-skel" />
                      )}
                      <span className="dc-badge">Öne çıkan</span>
                    </div>
                    <div className="dc-card__body">
                      <h3>{titleOf(item)}</h3>
                      <p className="dc-price">
                        {formatPrice(item.price_amount, item.price_currency)}
                      </p>
                      <p className="dc-meta">
                        {item.year}
                        <span>|</span>
                        {formatKm(item.mileage_km)}
                        <span>|</span>
                        {item.city || "—"}
                      </p>
                    </div>
                  </article>
                ) : (
                  <div key={`sk-${i}`} className="dc-card dc-card--skel" aria-hidden />
                ),
              )}
            </div>
            <button
              type="button"
              className="dc-rail-btn dc-rail-btn--next"
              onClick={() => scrollRail(1)}
              aria-label="Sağa"
            >
              ›
            </button>
          </div>
        </section>

        {/* —— Seyyare services (extra) —— */}
        <section className="dc-sec" id="services">
          <div className="dc-sec__head">
            <h2>Seyyare servisleri</h2>
            <button type="button" className="dc-linkbtn" onClick={() => setMoreOpen((v) => !v)}>
              {moreOpen ? "Gizle" : "Daha fazla"}
            </button>
          </div>
          <div className="dc-services">
            {SERVICES.slice(0, moreOpen ? SERVICES.length : 4).map((s) => (
              <a key={s.id} className="dc-service" href={s.href}>
                <strong>{s.label}</strong>
                <span>{s.desc}</span>
              </a>
            ))}
          </div>
          <div className="dc-trust">
            <span>Doğrulanmış satıcı</span>
            <span>AI asistan</span>
            <span>Cüzdan ödemesi</span>
          </div>
        </section>

        {/* —— Live auctions (extra) —— */}
        <section className="dc-sec" id="auctions">
          <div className="dc-sec__head">
            <h2>Canlı müzayedeler</h2>
            <a href="#auctions">
              Tümünü gör <span aria-hidden>›</span>
            </a>
          </div>
          <div className="dc-rail">
            {DEMO_AUCTIONS.map((a) => (
              <article key={a.id} className="dc-card dc-card--auction">
                <div className="dc-card__media">
                  <img src={a.cover} alt="" loading="lazy" />
                  <span className="dc-badge dc-badge--live">Canlı</span>
                </div>
                <div className="dc-card__body">
                  <h3>{a.title}</h3>
                  <p className="dc-price">{a.bid}</p>
                  <p className="dc-meta">
                    {a.bids} teklif
                    <span>|</span>
                    {a.city}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* —— Dealers —— */}
        <section className="dc-sec" id="dealers">
          <div className="dc-sec__head">
            <h2>Öne çıkan galeriler</h2>
            <a href="#dealers">
              Tüm galeriler <span aria-hidden>›</span>
            </a>
          </div>
          <div className="dc-rail">
            {DEMO_DEALERS.map((d) => (
              <article key={d.id} className="dc-dealer">
                <img src={d.cover} alt="" loading="lazy" />
                <div>
                  <h3>{d.name}</h3>
                  <p>{d.city}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* —— Sell CTA strip —— */}
        <section className="dc-cta" id="sell">
          <div className="dc-cta__inner">
            <div>
              <h2>Aracını şimdi sat</h2>
              <p>Ücretsiz ilan · galeri ve bireysel satıcılar · soft-launch hazır</p>
            </div>
            <a className="dc-btn dc-btn--solid" href="#app">
              Satmaya başla
            </a>
          </div>
        </section>

        {/* —— Popular brands —— */}
        <section className="dc-panel" id="brands">
          <div className="dc-panel__inner">
            <div className="dc-sec__head dc-sec__head--ink">
              <h2>Popüler markalar</h2>
              {brandId != null ? (
                <button type="button" className="dc-linkbtn" onClick={() => setBrandId(null)}>
                  Filtreyi kaldır
                </button>
              ) : (
                <a href="#listings">Tümünü gör ›</a>
              )}
            </div>
            <div className="dc-brands">
              {brands.slice(0, 12).map((b) => {
                const src = brandLogoUrl(b.name, b.name_en);
                const on = brandId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={`dc-brand ${on ? "is-on" : ""}`}
                    onClick={() => setBrandId(on ? null : b.id)}
                  >
                    <span className="dc-brand__logo">
                      {src ? (
                        <img
                          src={src}
                          alt=""
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <em>{b.name.charAt(0)}</em>
                    </span>
                    <span>{b.name.replace("Mercedes-Benz", "Mercedes")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* —— Lifestyle categories (DubiCars chips) —— */}
        <section className="dc-sec" id="lifestyle">
          <div className="dc-sec__head">
            <h2>Kategorilere göz at</h2>
          </div>
          <div className="dc-chips">
            {LIFESTYLE.map((c) => (
              <button key={c.id} type="button" onClick={() => filterTo(c.q || c.label)}>
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* —— Body type image cats —— */}
        <section className="dc-sec" id="cats">
          <div className="dc-sec__head">
            <h2>Kasa tipi</h2>
          </div>
          <div className="dc-cats">
            {BODY_TYPES.map((b) => (
              <button key={b.id} type="button" className="dc-cat" onClick={() => filterTo(b.q)}>
                <img src={b.image} alt="" loading="lazy" />
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* —— Popular models —— */}
        {popularModels.length > 0 ? (
          <section className="dc-sec" id="models">
            <div className="dc-sec__head">
              <h2>Popüler modeller</h2>
              <a href="#listings">Tümünü gör ›</a>
            </div>
            <div className="dc-rail">
              {popularModels.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  className="dc-model"
                  onClick={() => filterTo(m.name)}
                >
                  <div className="dc-model__media">
                    {m.cover_url ? (
                      <img src={m.cover_url} alt="" loading="lazy" />
                    ) : (
                      <div className="dc-skel" />
                    )}
                  </div>
                  <div className="dc-model__body">
                    <h3>{m.name}</h3>
                    <p>
                      {m.count} ilan · <strong>{m.price}</strong>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* —— Why buy —— */}
        <section className="dc-panel dc-panel--why" id="why">
          <div className="dc-panel__inner">
            <h2 className="dc-why__title">Neden Seyyare?</h2>
            <div className="dc-why">
              {WHY.map((w) => (
                <article key={w.title}>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* —— Rentals (extra) —— */}
        <section className="dc-sec" id="rentals">
          <div className="dc-sec__head">
            <h2>Kiralık araçlar</h2>
            <a href="#app">Uygulamada kirala ›</a>
          </div>
          <div className="dc-rail">
            {featured.slice(0, 6).map((item) => (
              <article key={`r-${item.id}`} className="dc-card">
                <div className="dc-card__media">
                  {item.cover_url ? (
                    <img src={item.cover_url} alt="" loading="lazy" />
                  ) : (
                    <div className="dc-skel" />
                  )}
                  <span className="dc-badge dc-badge--rent">Kiralık</span>
                </div>
                <div className="dc-card__body">
                  <h3>{titleOf(item)}</h3>
                  <p className="dc-price">
                    {Math.round(
                      (typeof item.price_amount === "string"
                        ? Number(item.price_amount)
                        : item.price_amount) / 120,
                    ).toLocaleString("tr-TR")}{" "}
                    IQD / gün
                  </p>
                  <p className="dc-meta">{item.city || "—"}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* —— Wallet (extra) —— */}
        <section className="dc-wallet" id="wallet">
          <div className="dc-wallet__inner">
            <div>
              <p className="dc-eyebrow">Ödeme</p>
              <h2>Cüzdan & Hatwan</h2>
              <p>IQD ve yerel yöntemlerle güvenli ödeme — soft-launch cüzdan hazır.</p>
            </div>
            <a className="dc-btn dc-btn--solid" href="#app">
              Cüzdanı aç
            </a>
          </div>
        </section>

        {/* —— AI strip (extra) —— */}
        <section className="dc-ai" id="ai">
          <div className="dc-ai__icon" aria-hidden>
            ✦
          </div>
          <div>
            <h2>AI asistan</h2>
            <p>Bütçe, şehir ve markaya göre öneri al — uygulamada sohbet et.</p>
          </div>
          <a className="dc-btn dc-btn--outline-light" href="#app">
            Sor
          </a>
        </section>

        {/* —— All listings —— */}
        <section className="dc-panel" id="listings">
          <div className="dc-panel__inner">
            <div className="dc-sec__head dc-sec__head--ink">
              <h2>İlanlar</h2>
              <p className="dc-count">{loading ? "…" : `${list.length} sonuç`}</p>
            </div>
            {error ? <p className="dc-alert">{error}</p> : null}
            <div className="dc-grid">
              {(loading ? Array.from<Vehicle>({ length: 8 }) : list).map((item, i) =>
                item ? (
                  <article key={item.id} className="dc-card dc-card--grid">
                    <div className="dc-card__media">
                      {item.cover_url ? (
                        <img src={item.cover_url} alt="" loading="lazy" />
                      ) : (
                        <div className="dc-skel" />
                      )}
                      {item.featured ? <span className="dc-badge">Öne çıkan</span> : null}
                    </div>
                    <div className="dc-card__body">
                      <h3>{titleOf(item)}</h3>
                      <p className="dc-price">
                        {formatPrice(item.price_amount, item.price_currency)}
                      </p>
                      <p className="dc-meta">
                        {item.year}
                        <span>|</span>
                        {formatKm(item.mileage_km)}
                        <span>|</span>
                        {item.city || "—"}
                      </p>
                    </div>
                  </article>
                ) : (
                  <div key={`gsk-${i}`} className="dc-card dc-card--skel" aria-hidden />
                ),
              )}
            </div>
          </div>
        </section>

        {/* —— App download —— */}
        <section className="dc-app" id="app">
          <img src="/brand/seyyare-mark-dark.png" alt="" width={48} height={48} />
          <div>
            <h2>Mobilde devam et</h2>
            <p>Android soft APK hazır · mağaza yayını prod domain sonrası.</p>
          </div>
        </section>
      </main>

      <footer className="dc-foot">
        <div className="dc-foot__inner">
          <div className="dc-foot__brand">
            <img src="/brand/seyyare-mark-light.png" alt="" width={24} height={24} />
            <span>
              seyyare<span>.men</span>
            </span>
          </div>
          <div className="dc-foot__cols">
            <div>
              <h4>Alışveriş</h4>
              <a href="#listings">İkinci el</a>
              <a href="#rentals">Kiralama</a>
              <a href="#auctions">Müzayede</a>
            </div>
            <div>
              <h4>Servisler</h4>
              <a href="#services">Taksi</a>
              <a href="#wallet">Cüzdan</a>
              <a href="#ai">AI asistan</a>
            </div>
            <div>
              <h4>Şirket</h4>
              <button type="button" onClick={() => setPage("privacy")}>
                Gizlilik
              </button>
              <button type="button" onClick={() => setPage("terms")}>
                Şartlar
              </button>
              <button type="button" onClick={() => setPage("pricing")}>
                Fiyatlandırma
              </button>
            </div>
          </div>
          <p>© {new Date().getFullYear()} Seyyare · Irak araç pazarı</p>
        </div>
      </footer>
    </div>
  );
}

function LegalPage({
  title,
  body,
  onBack,
}: {
  title: string;
  body: string[];
  onBack: () => void;
}) {
  return (
    <div className="dc-legal">
      <button type="button" className="dc-btn dc-btn--outline" onClick={onBack}>
        ← Ana sayfa
      </button>
      <h1>{title}</h1>
      {body.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}

const PRICING_FEES = [
  {
    title: "İlan yayınlama",
    val: "25.000",
    unit: "IQD / ilan",
    desc: "Her aktif ilan için tek seferlik ücret. Cüzdandan otomatik düşer.",
  },
  {
    title: "Öne çıkarma (App)",
    val: "15.000",
    unit: "IQD / 7 gün",
    desc: "Uygulama içi keşfet bölümünde üst sıralarda gösterim.",
  },
  {
    title: "Öne çıkarma (Sosyal)",
    val: "35.000",
    unit: "IQD / 7 gün",
    desc: "Instagram, Facebook ve Twitter'da otomatik paylaşım + DM mesajı.",
  },
  {
    title: "Escrow komisyonu",
    val: "%2",
    unit: "satış tutarı",
    desc: "Açık arttırma ve Kullo Güvenli Ödeme'de satıcıdan alınır.",
  },
  {
    title: "Yemek komisyonu",
    val: "%15",
    unit: "sipariş tutarı",
    desc: "Restoran siparişlerinden alınan platform payı. Teslimat ayrıca ücretlendirilir.",
  },
  {
    title: "Mağaza komisyonu",
    val: "%8",
    unit: "GMV",
    desc: "Shop dikeyinde (giyim, elektronik, ev) mağaza başına aylık oran.",
  },
  {
    title: "Yolculuk komisyonu",
    val: "%10",
    unit: "yolculuk tutarı",
    desc: "Taksi/ride hizmetinde sürücüden alınan platform payı.",
  },
  {
    title: "Kullo Onaylı rozeti",
    val: "50.000",
    unit: "IQD / ilan",
    desc: "Fiziksel muayene + belge kontrolü rozeti. 3 kata kadar daha fazla mesaj.",
  },
];

const PRICING_PLANS = [
  {
    id: "starter",
    eyebrow: "Bireysel",
    title: "Bireysel Satıcı",
    desc: "Bir-iki arası araç, ev veya ürün satmak isteyenler için.",
    priceMonth: "Ücretsiz",
    priceMonthValue: 0,
    priceYear: "Ücretsiz",
    billed: "Sadece yayınlama ücretleri geçerli.",
    cta: "Ücretsiz başla",
    ctaStyle: "outline" as const,
    features: [
      { on: true, text: "Sınırsız ilan taslağı" },
      { on: true, text: "25.000 IQD listing fee (ilan başına)" },
      { on: true, text: "AI fiyat tahmini (aylık 3 ücretsiz)" },
      { on: true, text: "5 dilde otomatik çeviri" },
      { on: true, text: "Cüzdan & Hatwan ödemesi" },
      { on: false, text: "AI hasar raporu" },
      { on: false, text: "Öne çıkarma indirimi" },
      { on: false, text: "Mağaza sayfası & CRM" },
    ],
  },
  {
    id: "pro",
    eyebrow: "En popüler",
    title: "AI Pro",
    desc: "Sık ilan veren, açık arttırma kullanan ve AI'dan tam yararlanan kullanıcılar için.",
    priceMonth: "9.99",
    priceYear: "99",
    billed: "Aylık · yıllık abonelikle %17 indirim.",
    cta: "AI Pro'ya geç",
    ctaStyle: "solid" as const,
    feature: true,
    features: [
      { on: true, text: "Sınırsız ilan + 0 IQD listing fee" },
      { on: true, text: "Sınırsız AI fiyat tahmini" },
      { on: true, text: "AI hasar raporu (aylık 20)" },
      { on: true, text: "AI ilan yazımı + 5 dil çevirisi" },
      { on: true, text: "Öne çıkarma paketlerinde %30 indirim" },
      { on: true, text: "Müzayede erken erişim" },
      { on: false, text: "Bayi vitrini & CRM" },
      { on: false, text: "API erişimi" },
    ],
  },
  {
    id: "dealer",
    eyebrow: "Bayi & Kurumsal",
    title: "Bayi / Kurumsal",
    desc: "Galeriler, emlakçılar, mağazalar, restoranlar ve kurumsal satıcılar için.",
    priceMonth: "49",
    priceYear: "490",
    billed: "Bayi · Emlakçı · Mağazacı · Restoran rolleri için aylık abonelik.",
    cta: "Bayi olarak başvur",
    ctaStyle: "solid" as const,
    features: [
      { on: true, text: "AI Pro'daki her şey dahil" },
      { on: true, text: "Sınırsız ilan + 0 IQD listing fee" },
      { on: true, text: "Bayi vitrini & mağaza sayfası" },
      { on: true, text: "Müşteri CRM ve sohbet otomasyonu" },
      { on: true, text: "Öne çıkarma paketlerinde %50 indirim" },
      { on: true, text: "Sınırsız AI hasar raporu" },
      { on: true, text: "Çoklu kullanıcı & ekip yönetimi" },
      { on: true, text: "Öncelikli destek & API erişimi" },
    ],
  },
];

const PRICING_FAQ = [
  {
    q: "Listing fee (ilan ücreti) ne zaman alınır?",
    a: "İlan yayına alınırken bir defa alınır. İlan 60 gün boyunca aktif kalır; yeniden yayına alırsanız tekrar ücretlenir. Taslak ilanlar ücretsizdir.",
  },
  {
    q: "AI Pro abonelik ücreti iade edilir mi?",
    a: "İlk 7 gün içinde tam iade. Sonrasında yıllık planda kalan süre için orantılı iade uygulanır.",
  },
  {
    q: "Bayi paketinde komisyon oranları değişir mi?",
    a: "Evet. Bayi/Kurumsal üyeler escrow komisyonunda %50 indirim alır (örn. açık arttırma %2 yerine %1). Detaylar sözleşmede belirtilir.",
  },
  {
    q: "Hangi ödeme yöntemleriyle ödeyebilirim?",
    a: "Kullo Cüzdan (Hatwan), QI Card, Zain Cash, FIB, FastPay ve banka havalesi/EFT. Yemek ve mağaza siparişlerinde kapıda ödeme seçenekleri ayrıca aktiftir.",
  },
  {
    q: "5 dilde otomatik çeviri gerçekten ücretsiz mi?",
    a: "Bireysel pakette ilan başına 1 çeviri ücretsiz. AI Pro pakette sınırsız çeviri. Çeviri OpenRouter üzerinden yapılır ve kalitesi GPT-4o sınıfıdır.",
  },
  {
    q: "Kurumsal / API erişimi için ne yapmalıyım?",
    a: "Bayi/Kurumsal pakete abone olup sales@kullo.app üzerinden API anahtarı talep edin. 5.000+ stoklu galeriler ve zincir mağazalar için özel fiyatlandırma sunulur.",
  },
];

function PricingPage({
  onBack,
  onCta,
}: {
  onBack: () => void;
  onCta: () => void;
}) {
  const [cycle, setCycle] = useState<"month" | "year">("month");

  return (
    <div className="dc">
      <header className="dc-nav">
        <div className="dc-nav__inner">
          <button type="button" className="dc-nav__brand" onClick={onBack}>
            <img src="/brand/seyyare-mark-light.png" alt="" width={32} height={32} />
            <span>
              seyyare<span>.men</span>
            </span>
          </button>

          <nav className="dc-nav__links" aria-label="Ana menü">
            <a href="#plans" onClick={(e) => { e.preventDefault(); document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" }); }}>Planlar</a>
            <a href="#fees" onClick={(e) => { e.preventDefault(); document.getElementById("fees")?.scrollIntoView({ behavior: "smooth" }); }}>Ücretler</a>
            <a href="#compare" onClick={(e) => { e.preventDefault(); document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" }); }}>Karşılaştır</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }}>SSS</a>
          </nav>

          <div className="dc-nav__actions">
            <span className="dc-nav__lang" aria-hidden>
              🇮🇶 TR
            </span>
            <a className="dc-btn dc-btn--outline" href="#plans" onClick={(e) => { e.preventDefault(); document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" }); }}>
              Planları gör
            </a>
            <a className="dc-btn dc-btn--soft" onClick={onCta} href="#home">
              Ana sayfa
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="dc-pricing-hero">
          <p className="dc-eyebrow" style={{ color: "var(--accent)" }}>
            Fiyatlandırma
          </p>
          <h1>
            Sade, <em>şeffaf</em> fiyatlandırma
          </h1>
          <p>
            İlan yayınlama, öne çıkarma, abonelik ve komisyonlar — tek bir sayfa. Gizli
            ücret yok, sürpriz fatura yok.
          </p>

          <div className="dc-pricing-toggle" role="tablist" aria-label="Faturalama döngüsü">
            <button
              type="button"
              className={cycle === "month" ? "is-on" : ""}
              onClick={() => setCycle("month")}
              role="tab"
              aria-selected={cycle === "month"}
            >
              Aylık
            </button>
            <button
              type="button"
              className={cycle === "year" ? "is-on" : ""}
              onClick={() => setCycle("year")}
              role="tab"
              aria-selected={cycle === "year"}
            >
              Yıllık <span style={{ color: "#fff", background: "var(--accent)", borderRadius: 999, padding: "0.1rem 0.4rem", fontSize: "0.7rem", marginLeft: "0.3rem" }}>−%17</span>
            </button>
          </div>
        </section>

        <section className="dc-pricing-grid" id="plans">
          {PRICING_PLANS.map((p) => (
            <article
              key={p.id}
              className={`dc-plan ${p.feature ? "dc-plan--feature" : ""}`}
            >
              {p.feature ? <span className="dc-plan__badge">En popüler</span> : null}
              <p className="dc-plan__eyebrow">{p.eyebrow}</p>
              <h2 className="dc-plan__title">{p.title}</h2>
              <p className="dc-plan__desc">{p.desc}</p>
              <div className="dc-plan__price">
                {p.priceMonthValue === 0 ? (
                  <strong>Ücretsiz</strong>
                ) : (
                  <>
                    <strong>
                      {cycle === "month" ? `$${p.priceMonth}` : `$${p.priceYear}`}
                    </strong>
                    <span>/ {cycle === "month" ? "ay" : "yıl"}</span>
                  </>
                )}
              </div>
              <p className="dc-plan__billed">{p.billed}</p>
              <a
                className={`dc-plan__cta dc-plan__cta--${p.ctaStyle}`}
                href="#cta"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {p.cta}
              </a>
              <ul className="dc-plan__feat">
                {p.features.map((f, i) => (
                  <li key={i} className={f.on ? "" : "is-mute"}>
                    {f.text}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="dc-fees" id="fees">
          <h2>Birim ücretler & komisyonlar</h2>
          <p className="dc-fees__lead">
            Hangi işlemde ne kadar ücret alındığını net gör. Tüm ücretler IQD cinsinden
            ve KDV hariçtir. Yıllık bayi sözleşmelerinde özel oranlar uygulanır.
          </p>
          <div className="dc-fees__grid">
            {PRICING_FEES.map((f) => (
              <div key={f.title} className="dc-fee">
                <p className="dc-fee__title">{f.title}</p>
                <p className="dc-fee__val">
                  {f.val}
                  <small>{f.unit}</small>
                </p>
                <p className="dc-fee__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dc-compare" id="compare">
          <h2>Planları yan yana karşılaştır</h2>
          <p className="dc-compare__lead">
            Hangi özelliğin hangi paketle geldiğini tek tabloda gör.
          </p>
          <table className="dc-compare__table">
            <thead>
              <tr>
                <th>Özellik</th>
                <th>Bireysel</th>
                <th>AI Pro</th>
                <th>Bayi / Kurumsal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Aylık ilan ücreti</td>
                <td>25.000 IQD / ilan</td>
                <td className="is-on">0 IQD</td>
                <td className="is-on">0 IQD</td>
              </tr>
              <tr>
                <td>AI fiyat tahmini</td>
                <td>3 / ay</td>
                <td className="is-on">Sınırsız</td>
                <td className="is-on">Sınırsız</td>
              </tr>
              <tr>
                <td>AI hasar raporu</td>
                <td className="is-mute">Yok</td>
                <td className="is-on">20 / ay</td>
                <td className="is-on">Sınırsız</td>
              </tr>
              <tr>
                <td>5 dilde çeviri</td>
                <td>1 çeviri / ilan</td>
                <td className="is-on">Sınırsız</td>
                <td className="is-on">Sınırsız</td>
              </tr>
              <tr>
                <td>Öne çıkarma indirimi</td>
                <td className="is-mute">Yok</td>
                <td className="is-on">%30</td>
                <td className="is-on">%50</td>
              </tr>
              <tr>
                <td>Mağaza sayfası & CRM</td>
                <td className="is-mute">Yok</td>
                <td className="is-mute">Yok</td>
                <td className="is-on">Var</td>
              </tr>
              <tr>
                <td>Escrow komisyonu</td>
                <td>%2</td>
                <td>%2</td>
                <td className="is-on">%1</td>
              </tr>
              <tr>
                <td>Müzayede erken erişim</td>
                <td className="is-mute">Yok</td>
                <td className="is-on">Var</td>
                <td className="is-on">Var</td>
              </tr>
              <tr>
                <td>API erişimi</td>
                <td className="is-mute">Yok</td>
                <td className="is-mute">Yok</td>
                <td className="is-on">Var</td>
              </tr>
              <tr>
                <td>Destek</td>
                <td>Topluluk</td>
                <td>7/24 uygulama içi</td>
                <td className="is-on">Öncelikli + telefon</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="dc-faq" id="faq">
          <h2>Sık sorulan sorular</h2>
          {PRICING_FAQ.map((f, i) => (
            <details key={i} className="dc-faq__item" {...(i === 0 ? { open: true } : {})}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <section className="dc-pricing-cta" id="cta">
          <div>
            <h2>Hâlâ karar veremedin mi?</h2>
            <p>
              Ücretsiz başla, AI Pro'yu 7 gün dene. Bayi paketi için ekibimiz seninle
              iletişime geçsin.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <a className="dc-btn dc-btn--accent" href="#app" onClick={onCta}>
              Ücretsiz başla
            </a>
            <a className="dc-btn" href="mailto:sales@kullo.app" style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
              Satış ekibiyle görüş
            </a>
          </div>
        </section>
      </main>

      <footer className="dc-foot">
        <div className="dc-foot__inner">
          <div className="dc-foot__brand">
            <img src="/brand/seyyare-mark-light.png" alt="" width={24} height={24} />
            <span>
              seyyare<span>.men</span>
            </span>
          </div>
          <div className="dc-foot__cols">
            <div>
              <h4>Alışveriş</h4>
              <a href="#listings">İkinci el</a>
              <a href="#rentals">Kiralama</a>
              <a href="#auctions">Müzayede</a>
            </div>
            <div>
              <h4>Servisler</h4>
              <a href="#services">Taksi</a>
              <a href="#wallet">Cüzdan</a>
              <a href="#ai">AI asistan</a>
            </div>
            <div>
              <h4>Şirket</h4>
              <button type="button" onClick={onBack}>
                Ana sayfa
              </button>
              <button type="button">Gizlilik</button>
              <button type="button">Şartlar</button>
            </div>
          </div>
          <p>© {new Date().getFullYear()} Seyyare · Irak araç pazarı</p>
        </div>
      </footer>
    </div>
  );
}
