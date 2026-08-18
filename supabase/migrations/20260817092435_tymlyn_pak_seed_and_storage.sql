/*
# TYMLYN PAK — seed data + storage bucket

## Overview
Inserts the single site_settings row, four categories, and five sample products
with placeholder product images. Also creates the `media` storage bucket for
admin uploads of product images, logo, and favicon, with public-read policies
so the storefront can display uploaded images.

## Data
- site_settings: one row with default brand content.
- categories: Classic, Premium, Luxury, New Arrivals.
- products: TYMLYN Royal Black, Gold Edition, Executive, Classic, Prestige.
- product_images: two placeholder images per product (Pexels watch photos).

## Storage
- Bucket `media` (public) for all admin image uploads.

## Security
- Storage policies: public SELECT on media bucket; authenticated INSERT/UPDATE/DELETE.
*/

-- site_settings single row
INSERT INTO site_settings (id, site_name, hero_title, hero_subtitle, hero_button_text, hero_button_link,
  banner_enabled, banner_title, banner_text, whatsapp_number, instagram_url, facebook_url,
  contact_number, email, address)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'TYMLYN PAK',
  'Timeless Luxury on Your Wrist',
  'Premium watches crafted for those who value elegance, precision, and presence.',
  'SHOP COLLECTION',
  '/collection',
  true,
  'New Arrivals Are Here',
  'Discover the latest additions to the TYMLYN PAK collection — engineered for distinction.',
  '923000000000',
  'https://instagram.com/tymlynpak',
  'https://facebook.com/tymlynpak',
  '+92 300 0000000',
  'orders@tymlynpak.com',
  'Lahore, Pakistan'
)
ON CONFLICT (id) DO NOTHING;

-- categories
INSERT INTO categories (name, slug) VALUES
  ('Classic', 'classic'),
  ('Premium', 'premium'),
  ('Luxury', 'luxury'),
  ('New Arrivals', 'new-arrivals')
ON CONFLICT (slug) DO NOTHING;

-- helper to get category id by slug
DO $$
DECLARE
  classic_id uuid;
  premium_id uuid;
  luxury_id uuid;
  new_id uuid;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
BEGIN
  SELECT id INTO classic_id FROM categories WHERE slug = 'classic';
  SELECT id INTO premium_id FROM categories WHERE slug = 'premium';
  SELECT id INTO luxury_id  FROM categories WHERE slug = 'luxury';
  SELECT id INTO new_id     FROM categories WHERE slug = 'new-arrivals';

  INSERT INTO products (name, slug, description, price, sale_price, category_id, sku, stock_quantity, is_available, is_featured, specifications)
  VALUES (
    'TYMLYN Royal Black', 'tymlyn-royal-black',
    'A commanding all-black timepiece with a sapphire crystal face and automatic movement. Designed for those who lead.',
    18500, 16500, luxury_id, 'TYM-RB-01', 12, true, true,
    '[{"label":"Case","value":"42mm Stainless Steel, PVD Black"},{"label":"Movement","value":"Automatic"},{"label":"Crystal","value":"Sapphire"},{"label":"Water Resistance","value":"50m"},{"label":"Strap","value":"Black Leather"}]'::jsonb
  ) RETURNING id INTO p1;

  INSERT INTO products (name, slug, description, price, sale_price, category_id, sku, stock_quantity, is_available, is_featured, specifications)
  VALUES (
    'TYMLYN Gold Edition', 'tymlyn-gold-edition',
    '18k gold-plated elegance with a sunburst dial and exhibition caseback. A statement of refined taste.',
    24000, NULL, luxury_id, 'TYM-GE-02', 8, true, true,
    '[{"label":"Case","value":"40mm Gold-Plated Steel"},{"label":"Movement","value":"Automatic"},{"label":"Crystal","value":"Sapphire"},{"label":"Water Resistance","value":"30m"},{"label":"Strap","value":"Brown Leather"}]'::jsonb
  ) RETURNING id INTO p2;

  INSERT INTO products (name, slug, description, price, sale_price, category_id, sku, stock_quantity, is_available, is_featured, specifications)
  VALUES (
    'TYMLYN Executive', 'tymlyn-executive',
    'A clean, professional dial with a steel bracelet. Built for the boardroom and beyond.',
    14500, 12500, premium_id, 'TYM-EX-03', 20, true, true,
    '[{"label":"Case","value":"41mm Stainless Steel"},{"label":"Movement","value":"Quartz"},{"label":"Crystal","value":"Mineral"},{"label":"Water Resistance","value":"30m"},{"label":"Strap","value":"Steel Bracelet"}]'::jsonb
  ) RETURNING id INTO p3;

  INSERT INTO products (name, slug, description, price, sale_price, category_id, sku, stock_quantity, is_available, is_featured, specifications)
  VALUES (
    'TYMLYN Classic', 'tymlyn-classic',
    'Minimalist design with a white dial and slim profile. The everyday luxury watch.',
    9500, NULL, classic_id, 'TYM-CL-04', 30, true, false,
    '[{"label":"Case","value":"38mm Stainless Steel"},{"label":"Movement","value":"Quartz"},{"label":"Crystal","value":"Mineral"},{"label":"Water Resistance","value":"30m"},{"label":"Strap","value":"Black Leather"}]'::jsonb
  ) RETURNING id INTO p4;

  INSERT INTO products (name, slug, description, price, sale_price, category_id, sku, stock_quantity, is_available, is_featured, specifications)
  VALUES (
    'TYMLYN Prestige', 'tymlyn-prestige',
    'Our flagship chronograph with a tachymeter bezel and rose-gold accents.',
    28500, 26000, new_id, 'TYM-PR-05', 5, true, true,
    '[{"label":"Case","value":"43mm Stainless Steel"},{"label":"Movement","value":"Chronograph"},{"label":"Crystal","value":"Sapphire"},{"label":"Water Resistance","value":"100m"},{"label":"Strap","value":"Steel Bracelet"}]'::jsonb
  ) RETURNING id INTO p5;

  -- product images (placeholder Pexels watch photos)
  INSERT INTO product_images (product_id, image_url, sort_order) VALUES
    (p1, 'https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg?auto=compress&cs=tinysrgb&w=1200', 0),
    (p1, 'https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
    (p2, 'https://images.pexels.com/photos/9978719/pexels-photo-9978719.jpeg?auto=compress&cs=tinysrgb&w=1200', 0),
    (p2, 'https://images.pexels.com/photos/9978719/pexels-photo-9978719.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
    (p3, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1200', 0),
    (p3, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
    (p4, 'https://images.pexels.com/photos/125779/pexels-photo-125779.jpeg?auto=compress&cs=tinysrgb&w=1200', 0),
    (p4, 'https://images.pexels.com/photos/125779/pexels-photo-125779.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
    (p5, 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=1200', 0),
    (p5, 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=800', 1)
  ON CONFLICT DO NOTHING;

  -- a few sample approved reviews
  INSERT INTO reviews (product_id, customer_name, rating, review, approved, featured) VALUES
    (p1, 'Ahmed R.', 5, 'Absolutely stunning watch. The black finish is flawless and it feels premium on the wrist.', true, true),
    (p2, 'Bilal K.', 5, 'The gold edition is worth every rupee. Got many compliments already.', true, true),
    (p3, 'Sana M.', 4, 'Beautiful executive watch, perfect for daily office wear.', true, false)
  ON CONFLICT DO NOTHING;
END $$;

-- ------------------------------------------------------------ storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- public read
DROP POLICY IF EXISTS "public_read_media" ON storage.objects;
CREATE POLICY "public_read_media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

-- authenticated upload
DROP POLICY IF EXISTS "admin_insert_media" ON storage.objects;
CREATE POLICY "admin_insert_media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

-- authenticated update (replace)
DROP POLICY IF EXISTS "admin_update_media" ON storage.objects;
CREATE POLICY "admin_update_media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

-- authenticated delete
DROP POLICY IF EXISTS "admin_delete_media" ON storage.objects;
CREATE POLICY "admin_delete_media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media');
