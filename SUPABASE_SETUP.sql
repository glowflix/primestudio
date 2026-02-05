-- ====================================================
-- SUPABASE SETUP INSTRUCTIONS
-- ====================================================
-- 
-- 1. Go to Supabase Console → SQL Editor
-- 2. Copy & paste the SQL below
-- 3. Click "Run"
-- 
-- ====================================================

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own messages
CREATE POLICY "user_read_own_messages"
ON messages FOR SELECT
USING (auth.uid() = sender_id);

-- Policy: Users can insert their own messages
CREATE POLICY "user_send_message"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- ====================================================
-- OPTIONAL: Create profiles table (for future use)
-- ====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  bio TEXT,
  category TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "user_read_own_profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "user_update_own_profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "user_insert_own_profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ====================================================
-- GOOGLE OAUTH SETUP (Next.js)
-- ====================================================
--
-- In Supabase Console:
-- 1. Go to Authentication → Providers → Google
-- 2. Enable Google
-- 3. Add your OAuth credentials (from Google Cloud Console)
-- 4. Add redirect URL:
--    - Development: http://localhost:3001/auth/callback
--    - Production: https://primestudios.store/auth/callback
--
-- ====================================================

-- That's it! Your database is ready for Prime Studio 🎉
