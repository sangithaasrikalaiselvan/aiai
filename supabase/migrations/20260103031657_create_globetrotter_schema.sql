/*
  # GlobeTrotter Travel Planning Platform - Database Schema

  ## Overview
  Complete database schema for a travel planning application that supports
  multi-city itineraries, activity planning, budget tracking, and social sharing.

  ## New Tables

  ### 1. profiles
  Extended user profile information
  - `id` (uuid, references auth.users)
  - `full_name` (text)
  - `avatar_url` (text, optional)
  - `language_preference` (text, default 'en')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. cities
  Reference data for cities worldwide
  - `id` (uuid, primary key)
  - `name` (text, city name)
  - `country` (text)
  - `region` (text, e.g., Europe, Asia)
  - `latitude` (decimal)
  - `longitude` (decimal)
  - `cost_index` (integer, 1-5 scale, 3 = moderate)
  - `popularity_score` (integer, 0-100)
  - `description` (text)
  - `image_url` (text)
  - `created_at` (timestamptz)

  ### 3. activities
  Reference data for activities and experiences
  - `id` (uuid, primary key)
  - `city_id` (uuid, references cities)
  - `name` (text)
  - `description` (text)
  - `category` (text, e.g., sightseeing, food, adventure)
  - `estimated_cost` (decimal)
  - `estimated_duration_hours` (decimal)
  - `image_url` (text)
  - `created_at` (timestamptz)

  ### 4. trips
  User-created travel plans
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text)
  - `description` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `cover_photo_url` (text)
  - `is_public` (boolean, default false)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. trip_stops
  Cities included in a trip with dates
  - `id` (uuid, primary key)
  - `trip_id` (uuid, references trips)
  - `city_id` (uuid, references cities)
  - `arrival_date` (date)
  - `departure_date` (date)
  - `order_index` (integer, for sequencing)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 6. stop_activities
  Activities assigned to each stop
  - `id` (uuid, primary key)
  - `stop_id` (uuid, references trip_stops)
  - `activity_id` (uuid, references activities)
  - `scheduled_date` (date)
  - `scheduled_time` (time)
  - `actual_cost` (decimal, user can override estimate)
  - `notes` (text)
  - `is_completed` (boolean, default false)
  - `created_at` (timestamptz)

  ### 7. trip_expenses
  Additional expenses and budget tracking
  - `id` (uuid, primary key)
  - `trip_id` (uuid, references trips)
  - `stop_id` (uuid, optional, references trip_stops)
  - `category` (text, e.g., transport, accommodation, meals, activities)
  - `description` (text)
  - `amount` (decimal)
  - `expense_date` (date)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Public trips are readable by anyone
  - Cities and activities are readable by all authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  language_preference text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  region text,
  latitude decimal(9,6),
  longitude decimal(9,6),
  cost_index integer DEFAULT 3 CHECK (cost_index >= 1 AND cost_index <= 5),
  popularity_score integer DEFAULT 50 CHECK (popularity_score >= 0 AND popularity_score <= 100),
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by authenticated users"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES cities ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  estimated_cost decimal(10,2) DEFAULT 0,
  estimated_duration_hours decimal(4,1) DEFAULT 1,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities are viewable by authenticated users"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  cover_photo_url text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public trips are viewable by anyone"
  ON trips FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trip_stops table
CREATE TABLE IF NOT EXISTS trip_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities ON DELETE RESTRICT,
  arrival_date date,
  departure_date date,
  order_index integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stops for their trips"
  ON trip_stops FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can insert stops for their trips"
  ON trip_stops FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stops for their trips"
  ON trip_stops FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stops for their trips"
  ON trip_stops FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create stop_activities table
CREATE TABLE IF NOT EXISTS stop_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid NOT NULL REFERENCES trip_stops ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES activities ON DELETE RESTRICT,
  scheduled_date date,
  scheduled_time time,
  actual_cost decimal(10,2),
  notes text,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stop_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for their trip stops"
  ON stop_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = stop_activities.stop_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can insert activities for their trip stops"
  ON stop_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = stop_activities.stop_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update activities for their trip stops"
  ON stop_activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = stop_activities.stop_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = stop_activities.stop_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activities for their trip stops"
  ON stop_activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = stop_activities.stop_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create trip_expenses table
CREATE TABLE IF NOT EXISTS trip_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips ON DELETE CASCADE,
  stop_id uuid REFERENCES trip_stops ON DELETE SET NULL,
  category text NOT NULL,
  description text,
  amount decimal(10,2) NOT NULL,
  expense_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trip_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses for their trips"
  ON trip_expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can insert expenses for their trips"
  ON trip_expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses for their trips"
  ON trip_expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses for their trips"
  ON trip_expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country);
CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region);
CREATE INDEX IF NOT EXISTS idx_activities_city_id ON activities(city_id);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_is_public ON trips(is_public);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_city_id ON trip_stops(city_id);
CREATE INDEX IF NOT EXISTS idx_stop_activities_stop_id ON stop_activities(stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip_id ON trip_expenses(trip_id);