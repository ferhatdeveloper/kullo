-- kullo — Multi-vertical classifieds core (Sahibinden-style)
-- listings + categories + realty/goods attrs; vehicles remain source of truth for cars.
-- Depends on: 001 (users, vehicles, vehicle_media)

SET search_path TO public;

-- Expand seller roles for new verticals
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('user','dealer','admin','realtor','shopkeeper','restaurant','courier'));

-- ============== CATEGORIES (tree) ==============
CREATE TABLE IF NOT EXISTS public.categories (
  id serial PRIMARY KEY,
  parent_id int REFERENCES public.categories(id) ON DELETE CASCADE,
  slug varchar(64) NOT NULL UNIQUE,
  vertical varchar(24) NOT NULL
    CHECK (vertical IN ('vehicle','realty','goods','other')),
  name jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_vertical ON public.categories(vertical);

INSERT INTO public.categories (slug, vertical, name, sort_order) VALUES
  ('vasita', 'vehicle', '{"tr":"Vasıta","en":"Vehicles","ar":"مركبات","fa":"وسایل نقلیه","ku-bad":"Otomobîl","ku-sor":"ئۆتۆمبێل"}', 10),
  ('emlak', 'realty', '{"tr":"Emlak","en":"Real Estate","ar":"عقارات","fa":"املاک","ku-bad":"Xanî","ku-sor":"خانوو"}', 20),
  ('alisveris', 'goods', '{"tr":"Alışveriş","en":"Shopping","ar":"تسوق","fa":"خرید","ku-bad":"Kirîn","ku-sor":"کڕین"}', 30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, parent_id, vertical, name, sort_order)
SELECT 'otomobil', id, 'vehicle', '{"tr":"Otomobil","en":"Cars"}', 1
FROM public.categories WHERE slug = 'vasita'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, parent_id, vertical, name, sort_order)
SELECT v.slug, c.id, 'realty', v.name::jsonb, v.sort_order
FROM public.categories c
CROSS JOIN (VALUES
  ('konut', '{"tr":"Konut","en":"Housing"}', 1),
  ('arsa', '{"tr":"Arsa","en":"Land"}', 2),
  ('isyeri', '{"tr":"İşyeri","en":"Commercial"}', 3)
) AS v(slug, name, sort_order)
WHERE c.slug = 'emlak'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, parent_id, vertical, name, sort_order)
SELECT v.slug, c.id, 'goods', v.name::jsonb, v.sort_order
FROM public.categories c
CROSS JOIN (VALUES
  ('giyim', '{"tr":"Giyim","en":"Fashion"}', 1),
  ('elektronik', '{"tr":"Elektronik","en":"Electronics"}', 2),
  ('ev-yasam', '{"tr":"Ev & Yaşam","en":"Home"}', 3)
) AS v(slug, name, sort_order)
WHERE c.slug = 'alisveris'
ON CONFLICT (slug) DO NOTHING;

-- ============== LISTINGS (shared classifieds) ==============
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id int NOT NULL REFERENCES public.categories(id),
  vertical varchar(24) NOT NULL
    CHECK (vertical IN ('vehicle','realty','goods','other')),
  vehicle_id uuid UNIQUE REFERENCES public.vehicles(id) ON DELETE SET NULL,
  title_original text NOT NULL,
  title_translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_original text,
  description_translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  price_amount bigint,
  price_currency char(3) NOT NULL DEFAULT 'IQD',
  negotiable boolean NOT NULL DEFAULT true,
  country_code char(2) REFERENCES public.countries(code),
  city varchar(64),
  geo geography(Point, 4326),
  cover_url text,
  status varchar(16) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','active','reserved','sold','expired','removed')),
  featured boolean NOT NULL DEFAULT false,
  views_count int NOT NULL DEFAULT 0,
  favorites_count int NOT NULL DEFAULT 0,
  attrs jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_tsv tsvector,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_vertical_status ON public.listings(vertical, status);
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON public.listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price_amount);
CREATE INDEX IF NOT EXISTS idx_listings_geo ON public.listings USING GIST(geo);
CREATE INDEX IF NOT EXISTS idx_listings_search_tsv ON public.listings USING GIN(search_tsv);
CREATE INDEX IF NOT EXISTS idx_listings_attrs ON public.listings USING GIN(attrs);
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city) WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.listings_search_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('simple', coalesce(NEW.title_original,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description_original,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.city,'')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_search_tsv ON public.listings;
CREATE TRIGGER trg_listings_search_tsv
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.listings_search_tsv_update();

CREATE TABLE IF NOT EXISTS public.listing_media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url text NOT NULL,
  thumbnail_url text,
  type varchar(16) NOT NULL DEFAULT 'image' CHECK (type IN ('image','video')),
  is_cover boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_media_listing
  ON public.listing_media(listing_id, sort_order);

-- ============== REALTY ATTRS ==============
CREATE TABLE IF NOT EXISTS public.realty_attrs (
  listing_id uuid PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  property_type varchar(24) NOT NULL
    CHECK (property_type IN ('housing','land','commercial')),
  offer_type varchar(16) NOT NULL DEFAULT 'sale'
    CHECK (offer_type IN ('sale','rent')),
  area_m2 numeric(12,2),
  rooms varchar(16),
  bathrooms int,
  floor int,
  building_age int,
  furnished boolean,
  deed_status varchar(32),
  zoning varchar(64),
  frontage_m numeric(10,2),
  extras jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_realty_attrs_type ON public.realty_attrs(property_type, offer_type);

-- ============== GOODS ATTRS (fashion / shopping) ==============
CREATE TABLE IF NOT EXISTS public.goods_attrs (
  listing_id uuid PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  brand varchar(64),
  size_label varchar(32),
  color_label varchar(32),
  condition varchar(16) NOT NULL DEFAULT 'used'
    CHECK (condition IN ('new','like_new','used')),
  stock_qty int NOT NULL DEFAULT 1 CHECK (stock_qty >= 0),
  gender varchar(16) CHECK (gender IS NULL OR gender IN ('women','men','unisex','kids')),
  extras jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_goods_attrs_brand ON public.goods_attrs(brand);
CREATE INDEX IF NOT EXISTS idx_goods_attrs_size ON public.goods_attrs(size_label);

-- ============== LISTING FAVORITES ==============
CREATE TABLE IF NOT EXISTS public.listing_favorites (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- ============== Backfill vehicles → listings ==============
INSERT INTO public.listings (
  id, seller_id, category_id, vertical, vehicle_id,
  title_original, title_translations, description_original, description_translations,
  price_amount, price_currency, negotiable, country_code, city, geo, cover_url,
  status, featured, views_count, favorites_count, published_at, expires_at, created_at, updated_at
)
SELECT
  v.id,
  v.seller_id,
  (SELECT id FROM public.categories WHERE slug = 'otomobil' LIMIT 1),
  'vehicle',
  v.id,
  coalesce(v.title_original, coalesce(v.make_custom, '') || ' ' || coalesce(v.model, '')),
  coalesce(v.title_translations, '{}'::jsonb),
  v.description_original,
  coalesce(v.description_translations, '{}'::jsonb),
  v.price_amount,
  coalesce(v.price_currency, 'IQD'),
  coalesce(v.negotiable, true),
  v.country_code,
  v.city,
  v.geo,
  v.cover_url,
  v.status,
  coalesce(v.featured, false),
  coalesce(v.views_count, 0),
  coalesce(v.favorites_count, 0),
  v.published_at,
  v.expires_at,
  v.created_at,
  v.updated_at
FROM public.vehicles v
WHERE NOT EXISTS (SELECT 1 FROM public.listings l WHERE l.vehicle_id = v.id);

-- Keep listing cover in sync when vehicle cover updates (best-effort)
CREATE OR REPLACE FUNCTION public.sync_vehicle_listing_cover() RETURNS trigger AS $$
BEGIN
  UPDATE public.listings
  SET cover_url = NEW.cover_url,
      price_amount = NEW.price_amount,
      price_currency = NEW.price_currency,
      status = NEW.status,
      city = NEW.city,
      featured = coalesce(NEW.featured, false),
      updated_at = now()
  WHERE vehicle_id = NEW.id;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_vehicle_listing ON public.vehicles;
CREATE TRIGGER trg_sync_vehicle_listing
  AFTER UPDATE OF cover_url, price_amount, price_currency, status, city, featured
  ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.sync_vehicle_listing_cover();

-- ============== RLS ==============
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS categories_select_all ON public.categories;
CREATE POLICY categories_select_all ON public.categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS categories_admin_all ON public.categories;
CREATE POLICY categories_admin_all ON public.categories
  FOR ALL USING (public.current_jwt_role() = 'admin')
  WITH CHECK (public.current_jwt_role() = 'admin');

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS listings_select_active ON public.listings;
CREATE POLICY listings_select_active ON public.listings
  FOR SELECT USING (
    status = 'active'
    OR seller_id = public.current_user_id()
    OR public.current_jwt_role() IN ('admin','dealer','realtor','shopkeeper')
  );
DROP POLICY IF EXISTS listings_insert_own ON public.listings;
CREATE POLICY listings_insert_own ON public.listings
  FOR INSERT WITH CHECK (seller_id = public.current_user_id());
DROP POLICY IF EXISTS listings_update_own ON public.listings;
CREATE POLICY listings_update_own ON public.listings
  FOR UPDATE USING (
    seller_id = public.current_user_id() OR public.current_jwt_role() = 'admin'
  )
  WITH CHECK (
    seller_id = public.current_user_id() OR public.current_jwt_role() = 'admin'
  );
DROP POLICY IF EXISTS listings_delete_own ON public.listings;
CREATE POLICY listings_delete_own ON public.listings
  FOR DELETE USING (
    seller_id = public.current_user_id() OR public.current_jwt_role() = 'admin'
  );

ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS listing_media_select_all ON public.listing_media;
CREATE POLICY listing_media_select_all ON public.listing_media FOR SELECT USING (true);
DROP POLICY IF EXISTS listing_media_modify_own ON public.listing_media;
CREATE POLICY listing_media_modify_own ON public.listing_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (l.seller_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (l.seller_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  );

ALTER TABLE public.realty_attrs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS realty_attrs_select_all ON public.realty_attrs;
CREATE POLICY realty_attrs_select_all ON public.realty_attrs FOR SELECT USING (true);
DROP POLICY IF EXISTS realty_attrs_modify_own ON public.realty_attrs;
CREATE POLICY realty_attrs_modify_own ON public.realty_attrs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (l.seller_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (l.seller_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  );

ALTER TABLE public.goods_attrs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS goods_attrs_select_all ON public.goods_attrs;
CREATE POLICY goods_attrs_select_all ON public.goods_attrs FOR SELECT USING (true);
DROP POLICY IF EXISTS goods_attrs_modify_own ON public.goods_attrs;
CREATE POLICY goods_attrs_modify_own ON public.goods_attrs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (l.seller_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (l.seller_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  );

ALTER TABLE public.listing_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS listing_favorites_own ON public.listing_favorites;
CREATE POLICY listing_favorites_own ON public.listing_favorites
  FOR ALL USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

GRANT SELECT ON public.categories TO anon, authenticated, dealer, admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated, dealer, admin;
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listing_media TO authenticated, dealer, admin;
GRANT SELECT ON public.listing_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.realty_attrs TO authenticated, dealer, admin;
GRANT SELECT ON public.realty_attrs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goods_attrs TO authenticated, dealer, admin;
GRANT SELECT ON public.goods_attrs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listing_favorites TO authenticated, dealer, admin;
GRANT USAGE, SELECT ON SEQUENCE public.categories_id_seq TO anon, authenticated, dealer, admin;
