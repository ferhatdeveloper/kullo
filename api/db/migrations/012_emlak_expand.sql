-- Expand emlak tree (Paya / Homele property types) — idempotent
-- Adapted for kullo marketplace schema (vertical = realty; no category_fields)
SET search_path TO public;

DO $$
DECLARE
  emlak_id int;
BEGIN
  SELECT id INTO emlak_id FROM public.categories WHERE slug = 'emlak' AND parent_id IS NULL LIMIT 1;
  IF emlak_id IS NULL THEN
    RAISE NOTICE 'emlak root missing — skip 012_emlak_expand';
    RETURN;
  END IF;

  INSERT INTO public.categories (parent_id, slug, vertical, name, sort_order)
  SELECT emlak_id, v.slug, 'realty', v.name::jsonb, v.sort_order
  FROM (VALUES
    ('villa', '{"tr":"Villa","en":"Villa","ar":"فيلا","ku-sor":"ڤیلا","fa":"ویلا"}', 50),
    ('proje', '{"tr":"Projeler","en":"Projects","ar":"مشاريع","ku-sor":"پڕۆژە","fa":"پروژه‌ها"}', 60),
    ('studiyo', '{"tr":"Stüdyo","en":"Studio","ar":"استوديو"}', 70),
    ('ciftlik', '{"tr":"Çiftlik","en":"Farm","ar":"مزرعة"}', 80)
  ) AS v(slug, name, sort_order)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c WHERE c.slug = v.slug AND c.parent_id = emlak_id
  );
END $$;
