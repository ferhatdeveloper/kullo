-- kullo — Food delivery (Yemeksepeti-style MVP)
-- Separate from listings: restaurants, menus, orders, courier delivery.
-- Depends on: 001 (users), 010 (role expansion).

SET search_path TO public;

-- ============== RESTAURANTS ==============
CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  cuisine varchar(64),
  city varchar(64) NOT NULL DEFAULT 'Erbil',
  country_code char(2) REFERENCES public.countries(code) DEFAULT 'IQ',
  address text,
  geo geography(Point, 4326),
  cover_url text,
  logo_url text,
  phone varchar(32),
  is_open boolean NOT NULL DEFAULT true,
  min_order_iqd bigint NOT NULL DEFAULT 5000,
  delivery_fee_iqd bigint NOT NULL DEFAULT 2000,
  eta_min int NOT NULL DEFAULT 35,
  rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  status varchar(16) NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','paused','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_city_status ON public.restaurants(city, status);
CREATE INDEX IF NOT EXISTS idx_restaurants_geo ON public.restaurants USING GIST(geo);

-- ============== MENU ==============
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant
  ON public.menu_categories(restaurant_id, sort_order);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price_iqd bigint NOT NULL CHECK (price_iqd >= 0),
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant
  ON public.menu_items(restaurant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_category
  ON public.menu_items(category_id);

-- ============== FOOD ORDERS ==============
CREATE TABLE IF NOT EXISTS public.food_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id),
  customer_id uuid NOT NULL REFERENCES public.users(id),
  courier_id uuid REFERENCES public.users(id),
  status varchar(24) NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending','accepted','preparing','ready',
      'on_the_way','delivered','cancelled','rejected'
    )),
  payment_method varchar(24) NOT NULL DEFAULT 'cash'
    CHECK (payment_method IN ('cash','wallet','card','qi','fastpay')),
  payment_status varchar(16) NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','paid','refunded')),
  subtotal_iqd bigint NOT NULL DEFAULT 0,
  delivery_fee_iqd bigint NOT NULL DEFAULT 0,
  total_iqd bigint NOT NULL DEFAULT 0,
  delivery_address text NOT NULL,
  delivery_note text,
  delivery_geo geography(Point, 4326),
  eta_min int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  delivered_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_food_orders_customer
  ON public.food_orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_orders_restaurant
  ON public.food_orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_food_orders_courier
  ON public.food_orders(courier_id, status)
  WHERE courier_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_food_orders_status
  ON public.food_orders(status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.food_order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name_snapshot text NOT NULL,
  unit_price_iqd bigint NOT NULL,
  qty int NOT NULL DEFAULT 1 CHECK (qty > 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_order_items_order
  ON public.food_order_items(order_id);

CREATE TABLE IF NOT EXISTS public.food_deliveries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.food_orders(id) ON DELETE CASCADE,
  courier_id uuid REFERENCES public.users(id),
  status varchar(24) NOT NULL DEFAULT 'unassigned'
    CHECK (status IN ('unassigned','assigned','picked_up','delivered','failed')),
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============== RLS ==============
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS restaurants_select_active ON public.restaurants;
CREATE POLICY restaurants_select_active ON public.restaurants
  FOR SELECT USING (
    status = 'active'
    OR owner_id = public.current_user_id()
    OR public.current_jwt_role() = 'admin'
  );
DROP POLICY IF EXISTS restaurants_modify_own ON public.restaurants;
CREATE POLICY restaurants_modify_own ON public.restaurants
  FOR ALL USING (
    owner_id = public.current_user_id() OR public.current_jwt_role() = 'admin'
  )
  WITH CHECK (
    owner_id = public.current_user_id() OR public.current_jwt_role() = 'admin'
  );

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_categories_select ON public.menu_categories;
CREATE POLICY menu_categories_select ON public.menu_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS menu_categories_modify ON public.menu_categories;
CREATE POLICY menu_categories_modify ON public.menu_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id
        AND (r.owner_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id
        AND (r.owner_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  );

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_items_select ON public.menu_items;
CREATE POLICY menu_items_select ON public.menu_items FOR SELECT USING (true);
DROP POLICY IF EXISTS menu_items_modify ON public.menu_items;
CREATE POLICY menu_items_modify ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id
        AND (r.owner_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id
        AND (r.owner_id = public.current_user_id() OR public.current_jwt_role() = 'admin')
    )
  );

ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS food_orders_select ON public.food_orders;
CREATE POLICY food_orders_select ON public.food_orders
  FOR SELECT USING (
    customer_id = public.current_user_id()
    OR courier_id = public.current_user_id()
    OR public.current_jwt_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = public.current_user_id()
    )
  );
DROP POLICY IF EXISTS food_orders_insert ON public.food_orders;
CREATE POLICY food_orders_insert ON public.food_orders
  FOR INSERT WITH CHECK (customer_id = public.current_user_id());
DROP POLICY IF EXISTS food_orders_update ON public.food_orders;
CREATE POLICY food_orders_update ON public.food_orders
  FOR UPDATE USING (
    customer_id = public.current_user_id()
    OR courier_id = public.current_user_id()
    OR public.current_jwt_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = public.current_user_id()
    )
  );

ALTER TABLE public.food_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS food_order_items_select ON public.food_order_items;
CREATE POLICY food_order_items_select ON public.food_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.food_orders o
      WHERE o.id = order_id
        AND (
          o.customer_id = public.current_user_id()
          OR o.courier_id = public.current_user_id()
          OR public.current_jwt_role() = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = o.restaurant_id AND r.owner_id = public.current_user_id()
          )
        )
    )
  );
DROP POLICY IF EXISTS food_order_items_insert ON public.food_order_items;
CREATE POLICY food_order_items_insert ON public.food_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.food_orders o
      WHERE o.id = order_id AND o.customer_id = public.current_user_id()
    )
  );

ALTER TABLE public.food_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS food_deliveries_select ON public.food_deliveries;
CREATE POLICY food_deliveries_select ON public.food_deliveries
  FOR SELECT USING (
    courier_id = public.current_user_id()
    OR public.current_jwt_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.food_orders o
      WHERE o.id = order_id
        AND (
          o.customer_id = public.current_user_id()
          OR EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = o.restaurant_id AND r.owner_id = public.current_user_id()
          )
        )
    )
  );
DROP POLICY IF EXISTS food_deliveries_modify ON public.food_deliveries;
CREATE POLICY food_deliveries_modify ON public.food_deliveries
  FOR ALL USING (
    courier_id = public.current_user_id() OR public.current_jwt_role() = 'admin'
  )
  WITH CHECK (
    courier_id = public.current_user_id() OR public.current_jwt_role() = 'admin'
  );

GRANT SELECT ON public.restaurants TO anon, authenticated, dealer, admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated, dealer, admin;
GRANT SELECT ON public.menu_categories, public.menu_items TO anon, authenticated, dealer, admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_categories, public.menu_items TO authenticated, dealer, admin;
GRANT SELECT, INSERT, UPDATE ON public.food_orders TO authenticated, dealer, admin;
GRANT SELECT, INSERT ON public.food_order_items TO authenticated, dealer, admin;
GRANT SELECT, INSERT, UPDATE ON public.food_deliveries TO authenticated, dealer, admin;
