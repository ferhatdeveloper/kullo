-- Seyyare.men — Search RPC
-- Full-text + PostGIS konum + filtre kombinasyonu

SET search_path TO public;

CREATE OR REPLACE FUNCTION public.search_vehicles(
  q text DEFAULT NULL,
  make_ids int[] DEFAULT NULL,
  body_type_ids int[] DEFAULT NULL,
  fuel_type_ids int[] DEFAULT NULL,
  transmission_ids int[] DEFAULT NULL,
  color_ids int[] DEFAULT NULL,
  p_country_code char(2) DEFAULT NULL,
  p_city text DEFAULT NULL,
  min_year int DEFAULT NULL,
  max_year int DEFAULT NULL,
  min_price bigint DEFAULT NULL,
  max_price bigint DEFAULT NULL,
  min_mileage int DEFAULT NULL,
  max_mileage int DEFAULT NULL,
  condition_filter varchar(16) DEFAULT NULL,
  lat double precision DEFAULT NULL,
  lng double precision DEFAULT NULL,
  radius_km int DEFAULT NULL,
  locale varchar(10) DEFAULT NULL,
  sort_by varchar(16) DEFAULT 'created_at',
  sort_dir varchar(4) DEFAULT 'desc',
  page_size int DEFAULT 20,
  page_offset int DEFAULT 0
) RETURNS TABLE (
  id uuid,
  title text,
  make_name text,
  model text,
  year int,
  mileage_km int,
  fuel_name text,
  transmission_name text,
  body_name text,
  color_name text,
  condition varchar(16),
  price_amount bigint,
  price_currency char(3),
  country_code char(2),
  city text,
  geo_lat double precision,
  geo_lng double precision,
  distance_km double precision,
  cover_url text,
  created_at timestamptz,
  rank real
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  order_clause text;
  center geography;
BEGIN
  -- Build dynamic ORDER BY
  order_clause := format(
    'ORDER BY %I %s, id DESC',
    CASE sort_by
      WHEN 'price' THEN 'price_amount'
      WHEN 'year' THEN 'year'
      WHEN 'mileage' THEN 'mileage_km'
      WHEN 'distance' THEN 'distance_km'
      ELSE 'created_at'
    END,
    CASE WHEN lower(sort_dir) = 'asc' THEN 'ASC' ELSE 'DESC' END
  );

  -- Center point for distance calc
  IF lat IS NOT NULL AND lng IS NOT NULL THEN
    center := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
  END IF;

  RETURN QUERY EXECUTE format(
    '
    SELECT
      v.id,
      coalesce(
        (SELECT value FROM jsonb_each_text(v.title_translations) WHERE key = $1 LIMIT 1),
        v.title_original
      ) AS title,
      coalesce(b.name->>$1, b.name->>''en'') AS make_name,
      v.model,
      v.year,
      v.mileage_km,
      coalesce(ft.name->>$1, ft.name->>''en'') AS fuel_name,
      coalesce(tt.name->>$1, tt.name->>''en'') AS transmission_name,
      coalesce(bt.name->>$1, bt.name->>''en'') AS body_name,
      coalesce(c.name->>$1, c.name->>''en'') AS color_name,
      v.condition,
      v.price_amount,
      v.price_currency,
      v.country_code,
      v.city,
      ST_Y(v.geo::geometry) AS geo_lat,
      ST_X(v.geo::geometry) AS geo_lng,
      CASE WHEN $2::geography IS NOT NULL
        THEN ST_Distance(v.geo, $2::geography) / 1000.0
        ELSE NULL
      END AS distance_km,
      coalesce(
        v.cover_url,
        (SELECT url FROM public.vehicle_media m WHERE m.vehicle_id = v.id ORDER BY m.is_cover DESC, m.sort_order ASC LIMIT 1)
      ) AS cover_url,
      v.created_at,
      CASE WHEN $3 IS NOT NULL THEN
        ts_rank(v.search_tsv, plainto_tsquery(''simple'', $3))
      ELSE 0 END AS rank
    FROM public.vehicles v
    LEFT JOIN public.brands b ON b.id = v.make_id
    LEFT JOIN public.fuel_types ft ON ft.id = v.fuel_type_id
    LEFT JOIN public.transmission_types tt ON tt.id = v.transmission_id
    LEFT JOIN public.body_types bt ON bt.id = v.body_type_id
    LEFT JOIN public.colors c ON c.id = v.color_id
    WHERE v.status = ''active''
      AND ($3 IS NULL OR v.search_tsv @@ plainto_tsquery(''simple'', $3))
      AND ($4::int[] IS NULL OR v.make_id = ANY($4::int[]))
      AND ($5::int[] IS NULL OR v.body_type_id = ANY($5::int[]))
      AND ($6::int[] IS NULL OR v.fuel_type_id = ANY($6::int[]))
      AND ($7::int[] IS NULL OR v.transmission_id = ANY($7::int[]))
      AND ($8::int[] IS NULL OR v.color_id = ANY($8::int[]))
      AND ($9::char(2) IS NULL OR v.country_code = $9::char(2))
      AND ($10 IS NULL OR lower(v.city) = lower($10))
      AND ($11 IS NULL OR v.year >= $11)
      AND ($12 IS NULL OR v.year <= $12)
      AND ($13::bigint IS NULL OR v.price_amount >= $13)
      AND ($14::bigint IS NULL OR v.price_amount <= $14)
      AND ($15 IS NULL OR v.mileage_km >= $15)
      AND ($16 IS NULL OR v.mileage_km <= $16)
      AND ($17 IS NULL OR v.condition = $17)
      AND ($2::geography IS NULL OR ST_DWithin(v.geo, $2::geography, $18 * 1000))
    %s
    LIMIT $19 OFFSET $20
    ',
    order_clause
  )
  USING
    locale,
    center,
    q,
    make_ids,
    body_type_ids,
    fuel_type_ids,
    transmission_ids,
    color_ids,
    p_country_code,
    p_city,
    min_year,
    max_year,
    min_price,
    max_price,
    min_mileage,
    max_mileage,
    condition_filter,
    radius_km,
    page_size,
    page_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_vehicles(
  text, int[], int[], int[], int[], int[], char(2), text,
  int, int, bigint, bigint, int, int, varchar,
  double precision, double precision, int, varchar,
  varchar, varchar, int, int
) TO anon, authenticated, dealer, admin;

-- Aktif ilan sayısı (liste / sayfalama için hafif RPC)
CREATE OR REPLACE FUNCTION public.count_active_listings()
RETURNS bigint
LANGUAGE sql STABLE AS $$
  SELECT count(*)::bigint FROM public.vehicles WHERE status = 'active';
$$;
GRANT EXECUTE ON FUNCTION public.count_active_listings() TO anon, authenticated, dealer, admin;

-- Home card feed from mv_active_listings_feed (see 006). Does not alter search_vehicles.
DROP FUNCTION IF EXISTS public.list_active_listings_feed(int, int);
DROP FUNCTION IF EXISTS public.list_active_listings_feed(int, int, varchar);

CREATE OR REPLACE FUNCTION public.list_active_listings_feed(
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0,
  p_locale varchar(10) DEFAULT 'en'
) RETURNS TABLE (
  id uuid,
  make_id int,
  make_name text,
  model text,
  year int,
  price_amount bigint,
  price_currency char(3),
  city text,
  country_code char(2),
  cover_url text,
  featured boolean,
  created_at timestamptz,
  status varchar(16),
  seller_id uuid,
  seller_name text,
  seller_verified boolean,
  seller_rating_avg numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    f.id,
    f.make_id,
    coalesce(f.make_name->>p_locale, f.make_name->>'en', f.make_name->>'tr') AS make_name,
    f.model::text,
    f.year,
    f.price_amount,
    f.price_currency,
    f.city::text,
    f.country_code,
    f.cover_url,
    f.featured,
    f.created_at,
    f.status,
    v.seller_id,
    coalesce(
      nullif(trim(dp.business_name), ''),
      nullif(trim(up.display_name), ''),
      'Seller'
    ) AS seller_name,
    coalesce(dp.verified, up.verified, false) AS seller_verified,
    coalesce(dp.rating_avg, up.rating_avg, 0) AS seller_rating_avg
  FROM public.mv_active_listings_feed f
  JOIN public.vehicles v ON v.id = f.id
  LEFT JOIN public.user_profiles up ON up.user_id = v.seller_id
  LEFT JOIN public.dealer_profiles dp ON dp.user_id = v.seller_id
  ORDER BY f.created_at DESC
  LIMIT greatest(1, least(coalesce(p_limit, 20), 100))
  OFFSET greatest(0, coalesce(p_offset, 0));
$$;
GRANT EXECUTE ON FUNCTION public.list_active_listings_feed(int, int, varchar)
  TO anon, authenticated, dealer, admin;

-- Remove ambiguous 2-arg overload (PostgREST PGRST203 when locale omitted)
DROP FUNCTION IF EXISTS public.list_active_listings_feed(int, int);

-- OpenSooq-style store / gallery directory
DROP FUNCTION IF EXISTS public.list_stores();
CREATE OR REPLACE FUNCTION public.list_stores()
RETURNS TABLE (
  id uuid,
  name text,
  city text,
  country_code char(2),
  verified boolean,
  rating_avg numeric,
  rating_count int,
  listing_count bigint,
  bio text,
  cover_url text,
  address text,
  phone text
) LANGUAGE sql STABLE AS $$
  SELECT
    d.user_id AS id,
    d.business_name AS name,
    d.city::text,
    d.country_code,
    coalesce(d.verified, false) AS verified,
    coalesce(d.rating_avg, 0) AS rating_avg,
    coalesce(d.rating_count, 0) AS rating_count,
    (
      SELECT count(*)::bigint
      FROM public.vehicles v
      WHERE v.seller_id = d.user_id AND v.status = 'active'
    ) AS listing_count,
    up.bio::text,
    coalesce(d.logo_url, up.avatar_url) AS cover_url,
    d.address::text,
    u.phone::text
  FROM public.dealer_profiles d
  LEFT JOIN public.user_profiles up ON up.user_id = d.user_id
  LEFT JOIN public.users u ON u.id = d.user_id
  ORDER BY d.verified DESC, d.rating_avg DESC NULLS LAST, d.business_name ASC;
$$;
GRANT EXECUTE ON FUNCTION public.list_stores()
  TO anon, authenticated, dealer, admin;

-- Marka listesi (locale'e göre)
DROP FUNCTION IF EXISTS public.list_brands(varchar);
CREATE OR REPLACE FUNCTION public.list_brands(locale varchar(10) DEFAULT 'en')
RETURNS TABLE(id int, name text, name_en text, logo_url text, is_premium boolean, is_electric boolean)
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    COALESCE(name->>$1, name->>'en') AS name,
    name->>'en' AS name_en,
    logo_url,
    is_premium,
    is_electric
  FROM public.brands
  ORDER BY is_premium DESC, COALESCE(name->>$1, name->>'en');
$$;
GRANT EXECUTE ON FUNCTION public.list_brands(varchar) TO anon, authenticated, dealer, admin;

-- Reference data (combobox için)
CREATE OR REPLACE FUNCTION public.list_reference_data(locale varchar(10) DEFAULT 'en')
RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'countries', (SELECT jsonb_agg(jsonb_build_object('code', code, 'name', COALESCE(name->>$1, name->>'en'), 'currency', currency_code, 'phone_code', phone_code, 'default_locale', default_locale)) FROM public.countries),
    'brands', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'name', COALESCE(name->>$1, name->>'en'),
        'name_en', name->>'en',
        'is_premium', is_premium,
        'is_electric', is_electric,
        'logo_url', logo_url
      ) ORDER BY is_premium DESC, COALESCE(name->>$1, name->>'en'))
      FROM public.brands
    ),
    'body_types', (SELECT jsonb_agg(jsonb_build_object('id', id, 'code', code, 'name', COALESCE(name->>$1, name->>'en'))) FROM public.body_types),
    'fuel_types', (SELECT jsonb_agg(jsonb_build_object('id', id, 'code', code, 'name', COALESCE(name->>$1, name->>'en'))) FROM public.fuel_types),
    'transmission_types', (SELECT jsonb_agg(jsonb_build_object('id', id, 'code', code, 'name', COALESCE(name->>$1, name->>'en'))) FROM public.transmission_types),
    'colors', (SELECT jsonb_agg(jsonb_build_object('id', id, 'code', code, 'hex', hex, 'name', COALESCE(name->>$1, name->>'en'))) FROM public.colors),
    'features', (SELECT jsonb_agg(jsonb_build_object('id', id, 'code', code, 'category', category, 'name', COALESCE(name->>$1, name->>'en'))) FROM public.features)
  );
$$;
GRANT EXECUTE ON FUNCTION public.list_reference_data(varchar) TO anon, authenticated, dealer, admin;
-- ============== Multi-vertical listing search ==============
CREATE OR REPLACE FUNCTION public.search_listings(
  p_vertical varchar(24) DEFAULT NULL,
  q text DEFAULT NULL,
  p_category_id int DEFAULT NULL,
  p_city text DEFAULT NULL,
  min_price bigint DEFAULT NULL,
  max_price bigint DEFAULT NULL,
  p_property_type varchar(24) DEFAULT NULL,
  p_offer_type varchar(16) DEFAULT NULL,
  p_size_label varchar(32) DEFAULT NULL,
  p_condition varchar(16) DEFAULT NULL,
  locale varchar(10) DEFAULT 'tr',
  sort_by varchar(16) DEFAULT 'created_at',
  sort_dir varchar(4) DEFAULT 'desc',
  page_size int DEFAULT 20,
  page_offset int DEFAULT 0
) RETURNS TABLE (
  id uuid,
  vertical varchar(24),
  category_slug text,
  title text,
  description text,
  price_amount bigint,
  price_currency char(3),
  city text,
  country_code char(2),
  cover_url text,
  featured boolean,
  attrs jsonb,
  created_at timestamptz,
  rank real
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  order_clause text;
BEGIN
  order_clause := format(
    'ORDER BY %I %s, id DESC',
    CASE sort_by
      WHEN 'price' THEN 'price_amount'
      ELSE 'created_at'
    END,
    CASE WHEN lower(sort_dir) = 'asc' THEN 'ASC' ELSE 'DESC' END
  );

  RETURN QUERY EXECUTE format(
    '
    SELECT
      l.id,
      l.vertical,
      c.slug::text AS category_slug,
      coalesce(
        (SELECT value FROM jsonb_each_text(l.title_translations) WHERE key = $1 LIMIT 1),
        l.title_original
      ) AS title,
      coalesce(
        (SELECT value FROM jsonb_each_text(l.description_translations) WHERE key = $1 LIMIT 1),
        l.description_original
      ) AS description,
      l.price_amount,
      l.price_currency,
      l.city::text,
      l.country_code,
      l.cover_url,
      l.featured,
      CASE
        WHEN l.vertical = ''realty'' THEN coalesce(to_jsonb(ra.*) - ''listing_id'', l.attrs)
        WHEN l.vertical = ''goods'' THEN coalesce(to_jsonb(ga.*) - ''listing_id'', l.attrs)
        ELSE l.attrs
      END AS attrs,
      l.created_at,
      CASE
        WHEN $2 IS NOT NULL AND length(trim($2)) > 0
          THEN ts_rank(l.search_tsv, plainto_tsquery(''simple'', $2))
        ELSE 0::real
      END AS rank
    FROM public.listings l
    JOIN public.categories c ON c.id = l.category_id
    LEFT JOIN public.realty_attrs ra ON ra.listing_id = l.id
    LEFT JOIN public.goods_attrs ga ON ga.listing_id = l.id
    WHERE l.status = ''active''
      AND ($3::varchar IS NULL OR l.vertical = $3)
      AND ($4::int IS NULL OR l.category_id = $4 OR c.parent_id = $4)
      AND ($5::text IS NULL OR lower(l.city) = lower($5))
      AND ($6::bigint IS NULL OR l.price_amount >= $6)
      AND ($7::bigint IS NULL OR l.price_amount <= $7)
      AND ($8::varchar IS NULL OR ra.property_type = $8)
      AND ($9::varchar IS NULL OR ra.offer_type = $9)
      AND ($10::varchar IS NULL OR ga.size_label = $10)
      AND ($11::varchar IS NULL OR ga.condition = $11)
      AND (
        $2 IS NULL OR length(trim($2)) = 0
        OR l.search_tsv @@ plainto_tsquery(''simple'', $2)
        OR l.title_original ILIKE ''%%'' || $2 || ''%%''
      )
    %s
    LIMIT $12 OFFSET $13
    ',
    order_clause
  )
  USING locale, q, p_vertical, p_category_id, p_city,
        min_price, max_price, p_property_type, p_offer_type,
        p_size_label, p_condition, page_size, page_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_listings(
  varchar, text, int, text, bigint, bigint, varchar, varchar, varchar, varchar, varchar, varchar, varchar, int, int
) TO anon, authenticated, dealer, admin;

CREATE OR REPLACE FUNCTION public.list_categories(
  p_vertical varchar(24) DEFAULT NULL,
  locale varchar(10) DEFAULT 'tr'
) RETURNS TABLE (
  id int,
  parent_id int,
  slug text,
  vertical varchar(24),
  name text,
  sort_order int
) LANGUAGE sql STABLE AS $$
  SELECT
    c.id,
    c.parent_id,
    c.slug::text,
    c.vertical,
    coalesce(c.name->>locale, c.name->>'en', c.name->>'tr', c.slug)::text,
    c.sort_order
  FROM public.categories c
  WHERE c.is_active = true
    AND (p_vertical IS NULL OR c.vertical = p_vertical)
  ORDER BY c.sort_order, c.id;
$$;

GRANT EXECUTE ON FUNCTION public.list_categories(varchar, varchar) TO anon, authenticated, dealer, admin;

CREATE OR REPLACE FUNCTION public.search_restaurants(
  p_city text DEFAULT NULL,
  q text DEFAULT NULL,
  page_size int DEFAULT 20,
  page_offset int DEFAULT 0
) RETURNS TABLE (
  id uuid,
  name text,
  cuisine text,
  city text,
  cover_url text,
  logo_url text,
  is_open boolean,
  min_order_iqd bigint,
  delivery_fee_iqd bigint,
  eta_min int,
  rating_avg numeric,
  rating_count int
) LANGUAGE sql STABLE AS $$
  SELECT
    r.id,
    r.name,
    r.cuisine,
    r.city::text,
    r.cover_url,
    r.logo_url,
    r.is_open,
    r.min_order_iqd,
    r.delivery_fee_iqd,
    r.eta_min,
    r.rating_avg,
    r.rating_count
  FROM public.restaurants r
  WHERE r.status = 'active'
    AND (p_city IS NULL OR lower(r.city) = lower(p_city))
    AND (
      q IS NULL OR length(trim(q)) = 0
      OR r.name ILIKE '%' || q || '%'
      OR coalesce(r.cuisine, '') ILIKE '%' || q || '%'
    )
  ORDER BY r.is_open DESC, r.rating_avg DESC, r.created_at DESC
  LIMIT page_size OFFSET page_offset;
$$;

GRANT EXECUTE ON FUNCTION public.search_restaurants(text, text, int, int)
  TO anon, authenticated, dealer, admin;
