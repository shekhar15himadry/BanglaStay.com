/*
# BanglaStay — Initial Schema

1. New Tables
- `destinations` — Bangladeshi travel destinations (Dhaka, Cox's Bazar, Sylhet, etc.)
  - id (uuid PK), name, slug, description, image_url, region, hotels_count (int)
- `hotels` — Hotel listings
  - id (uuid PK), name, slug, destination_id (FK destinations), description, address,
    star_rating (int 1-5), price_per_night (numeric), currency, image_url, gallery (text[]),
    amenities (text[]), latitude (numeric), longitude (numeric), rating (numeric 0-5),
    reviews_count (int), property_type (text), check_in_time, check_out_time
- `rooms` — Room types within a hotel
  - id (uuid PK), hotel_id (FK hotels), name, description, max_guests (int), bed_type,
    price_per_night (numeric), image_url, total_rooms (int)
- `reviews` — User reviews for hotels
  - id (uuid PK), hotel_id (FK hotels), user_id (FK auth.users), author_name (text),
    rating (int 1-5), title, comment, created_at
- `bookings` — User hotel bookings
  - id (uuid PK), user_id (FK auth.users DEFAULT auth.uid()), hotel_id (FK hotels),
    room_id (FK rooms), check_in (date), check_out (date), guests (int), total_price (numeric),
    status (text: pending/confirmed/cancelled), created_at
- `favorites` — User favorite hotels
  - id (uuid PK), user_id (FK auth.users DEFAULT auth.uid()), hotel_id (FK hotels), created_at

2. Security
- Enable RLS on all tables.
- destinations, hotels, rooms, reviews: SELECT is public (TO anon, authenticated) so the site is browsable without login.
- reviews INSERT/UPDATE/DELETE: owner-scoped (authenticated, user_id = auth.uid()).
- bookings: full CRUD owner-scoped (authenticated, user_id = auth.uid()).
- favorites: full CRUD owner-scoped (authenticated, user_id = auth.uid()).
- hotels/rooms INSERT/UPDATE/DELETE: authenticated only (admin-style, no ownership check since this is a content table).

3. Notes
- `user_id` columns on bookings and favorites default to auth.uid() so inserts that omit user_id succeed.
- reviews_count and rating on hotels are maintained via triggers for denormalized display.
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ destinations ============
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  region text,
  hotels_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_destinations" ON destinations;
CREATE POLICY "public_read_destinations" ON destinations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_destinations" ON destinations;
CREATE POLICY "auth_write_destinations" ON destinations FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============ hotels ============
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  description text,
  address text,
  star_rating int DEFAULT 3 CHECK (star_rating BETWEEN 1 AND 5),
  price_per_night numeric(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'BDT',
  image_url text,
  gallery text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  latitude numeric(9,6),
  longitude numeric(9,6),
  rating numeric(3,1) DEFAULT 0,
  reviews_count int DEFAULT 0,
  property_type text DEFAULT 'Hotel',
  check_in_time text DEFAULT '14:00',
  check_out_time text DEFAULT '12:00',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_hotels" ON hotels;
CREATE POLICY "public_read_hotels" ON hotels FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_hotels" ON hotels;
CREATE POLICY "auth_write_hotels" ON hotels FOR ALL
  TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_hotels_destination ON hotels(destination_id);
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug);

-- ============ rooms ============
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  max_guests int DEFAULT 2,
  bed_type text DEFAULT 'Double',
  price_per_night numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  total_rooms int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_rooms" ON rooms;
CREATE POLICY "public_read_rooms" ON rooms FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_write_rooms" ON rooms;
CREATE POLICY "auth_write_rooms" ON rooms FOR ALL
  TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel ON rooms(hotel_id);

-- ============ reviews ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  title text,
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_reviews" ON reviews;
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reviews" ON reviews;
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_reviews" ON reviews;
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_hotel ON reviews(hotel_id);

-- ============ bookings ============
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests int NOT NULL DEFAULT 1,
  total_price numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_bookings" ON bookings;
CREATE POLICY "select_own_bookings" ON bookings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_bookings" ON bookings;
CREATE POLICY "insert_own_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_bookings" ON bookings;
CREATE POLICY "update_own_bookings" ON bookings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_bookings" ON bookings;
CREATE POLICY "delete_own_bookings" ON bookings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel ON bookings(hotel_id);

-- ============ favorites ============
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, hotel_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- ============ Trigger: update hotel rating & reviews_count on review insert ============
CREATE OR REPLACE FUNCTION update_hotel_rating() RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric;
  cnt int;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COUNT(*) INTO avg_rating, cnt
  FROM reviews WHERE hotel_id = NEW.hotel_id;
  UPDATE hotels SET rating = ROUND(avg_rating, 1), reviews_count = cnt
  WHERE id = NEW.hotel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_hotel_rating ON reviews;
CREATE TRIGGER trg_update_hotel_rating
  AFTER INSERT OR DELETE OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_hotel_rating();
