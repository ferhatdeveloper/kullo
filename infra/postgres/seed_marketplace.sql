-- Demo seed for multi-vertical marketplace (optional, after 010/011)
-- Requires at least one user in public.users

SET search_path TO public;

-- Skip silently if no users yet
DO $$
DECLARE
  sid uuid;
  lid uuid;
  rid uuid;
  cat_konut int;
  cat_giyim int;
BEGIN
  SELECT id INTO sid FROM public.users ORDER BY created_at LIMIT 1;
  IF sid IS NULL THEN
    RAISE NOTICE 'seed_marketplace: no users, skip';
    RETURN;
  END IF;

  SELECT id INTO cat_konut FROM public.categories WHERE slug = 'konut';
  SELECT id INTO cat_giyim FROM public.categories WHERE slug = 'giyim';

  IF cat_konut IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.listings WHERE vertical = 'realty' LIMIT 1) THEN
    lid := uuid_generate_v4();
    INSERT INTO public.listings (
      id, seller_id, category_id, vertical, title_original, description_original,
      price_amount, price_currency, city, country_code, status, featured, published_at
    ) VALUES (
      lid, sid, cat_konut, 'realty',
      '3+1 Ankawa daire — satılık',
      'Yeni bina, asansör, otopark.',
      185000, 'USD', 'Erbil', 'IQ', 'active', true, now()
    );
    INSERT INTO public.realty_attrs (listing_id, property_type, offer_type, area_m2, rooms, bathrooms, deed_status)
    VALUES (lid, 'housing', 'sale', 145, '3+1', 2, 'tapulu');
  END IF;

  IF cat_giyim IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.listings WHERE vertical = 'goods' LIMIT 1) THEN
    lid := uuid_generate_v4();
    INSERT INTO public.listings (
      id, seller_id, category_id, vertical, title_original, description_original,
      price_amount, price_currency, city, country_code, status, featured, published_at
    ) VALUES (
      lid, sid, cat_giyim, 'goods',
      'Yazlık elbise — M',
      'Pamuklu, yeni sezon.',
      45000, 'IQD', 'Erbil', 'IQ', 'active', true, now()
    );
    INSERT INTO public.goods_attrs (listing_id, brand, size_label, color_label, condition, stock_qty, gender)
    VALUES (lid, 'Local Atelier', 'M', 'Bej', 'new', 4, 'women');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.restaurants LIMIT 1) THEN
    rid := uuid_generate_v4();
    INSERT INTO public.restaurants (
      id, owner_id, name, cuisine, city, country_code, address,
      is_open, min_order_iqd, delivery_fee_iqd, eta_min, rating_avg, rating_count, status
    ) VALUES (
      rid, sid, 'Dolma House Erbil', 'Kürt / Irak', 'Erbil', 'IQ', 'Ankawa, Erbil',
      true, 8000, 2000, 30, 4.7, 312, 'active'
    );
    INSERT INTO public.menu_items (restaurant_id, name, description, price_iqd, sort_order)
    VALUES
      (rid, 'Dolma tabağı', 'Zeytinyağlı yaprak dolma', 12000, 1),
      (rid, 'Biryani', 'Tavuklu biryani', 10000, 2);
  END IF;
END $$;
