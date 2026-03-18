-- ============================================
-- HomeCook Marketplace — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable PostGIS for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── PROFILES ───────────────────────────────
-- Stores both cook and household profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('cook', 'household')),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  
  -- Geographic location for proximity search
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  
  -- Cook-specific fields
  cuisines TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  price_range TEXT,
  service_radius_km INTEGER DEFAULT 10,
  
  -- Metrics
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update location geography from lat/lng
CREATE OR REPLACE FUNCTION update_profile_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_location
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_location();

-- ─── REVIEWS ────────────────────────────────
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cook_id, reviewer_id)
);

-- Auto-update cook's average rating
CREATE OR REPLACE FUNCTION update_cook_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE cook_id = COALESCE(NEW.cook_id, OLD.cook_id)),
    reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE cook_id = COALESCE(NEW.cook_id, OLD.cook_id))
  WHERE id = COALESCE(NEW.cook_id, OLD.cook_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cook_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_cook_rating();

-- ─── INQUIRIES (contact requests) ──────────
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FAVORITES ──────────────────────────────
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cook_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cook_id)
);

-- ─── INDEXES ────────────────────────────────
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_location ON public.profiles USING GIST(location);
CREATE INDEX idx_profiles_cuisines ON public.profiles USING GIN(cuisines);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_reviews_cook ON public.reviews(cook_id);
CREATE INDEX idx_inquiries_cook ON public.inquiries(cook_id);
CREATE INDEX idx_inquiries_household ON public.inquiries(household_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- ─── ROW LEVEL SECURITY ────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read cooks, users can update own profile
CREATE POLICY "Public cook profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (role = 'cook' OR id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (id = auth.uid());

-- Reviews: anyone can read, authenticated users can write
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Inquiries: involved parties can read/write
CREATE POLICY "Users see own inquiries"
  ON public.inquiries FOR SELECT
  USING (cook_id = auth.uid() OR household_id = auth.uid());

CREATE POLICY "Households can send inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (household_id = auth.uid());

CREATE POLICY "Cooks can update inquiry status"
  ON public.inquiries FOR UPDATE
  USING (cook_id = auth.uid());

-- Favorites: users manage own favorites
CREATE POLICY "Users see own favorites"
  ON public.favorites FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
  ON public.favorites FOR DELETE USING (user_id = auth.uid());

-- ─── FUNCTION: Nearby cooks search ─────────
CREATE OR REPLACE FUNCTION search_nearby_cooks(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km INTEGER DEFAULT 20,
  cuisine_filter TEXT[] DEFAULT NULL,
  day_filter TEXT DEFAULT NULL,
  price_filter TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'distance',
  result_limit INTEGER DEFAULT 50,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  cuisines TEXT[],
  availability JSONB,
  price_range TEXT,
  service_radius_km INTEGER,
  rating NUMERIC,
  reviews_count INTEGER,
  verified BOOLEAN,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.full_name, p.avatar_url, p.bio, p.city,
    p.cuisines, p.availability, p.price_range, p.service_radius_km,
    p.rating, p.reviews_count, p.verified,
    p.latitude, p.longitude,
    ROUND((ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000)::numeric, 1)::double precision AS distance_km
  FROM public.profiles p
  WHERE p.role = 'cook'
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
    AND (cuisine_filter IS NULL OR p.cuisines && cuisine_filter)
    AND (price_filter IS NULL OR p.price_range = price_filter)
    AND (day_filter IS NULL OR p.availability ? day_filter)
    AND (search_query IS NULL OR (
      p.full_name ILIKE '%' || search_query || '%'
      OR p.bio ILIKE '%' || search_query || '%'
      OR p.city ILIKE '%' || search_query || '%'
      OR EXISTS (SELECT 1 FROM unnest(p.cuisines) c WHERE c ILIKE '%' || search_query || '%')
    ))
  ORDER BY
    CASE WHEN sort_by = 'distance' THEN ST_Distance(p.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) END ASC,
    CASE WHEN sort_by = 'rating' THEN p.rating END DESC,
    CASE WHEN sort_by = 'reviews' THEN p.reviews_count END DESC
  LIMIT result_limit OFFSET result_offset;
END;
$$ LANGUAGE plpgsql;
