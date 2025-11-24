-- GhostSwap Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- GROUPS TABLE
-- ============================================
CREATE TYPE group_status AS ENUM ('PLANNING', 'DRAWN');

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  budget DECIMAL(10, 2),
  exchange_date DATE,
  status group_status DEFAULT 'PLANNING',
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for invite code lookups
CREATE INDEX idx_groups_invite_code ON groups(invite_code);

-- ============================================
-- MEMBERS TABLE (created before groups RLS policies)
-- ============================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wishlist JSONB DEFAULT '[]'::jsonb,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Indexes
CREATE INDEX idx_members_group_id ON members(group_id);
CREATE INDEX idx_members_user_id ON members(user_id);

-- ============================================
-- RLS POLICIES FOR GROUPS (after members table exists)
-- ============================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view groups they are members of" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members WHERE members.group_id = groups.id AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their groups" ON groups
  FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their groups" ON groups
  FOR DELETE USING (auth.uid() = admin_id);

-- ============================================
-- RLS POLICIES FOR MEMBERS
-- ============================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their groups" ON members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members m WHERE m.group_id = members.group_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" ON members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership" ON members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can remove members" ON members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups WHERE groups.id = members.group_id AND groups.admin_id = auth.uid()
    )
  );

-- ============================================
-- MATCHES TABLE (Secret Santa assignments)
-- ============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, giver_id)
);

-- Indexes
CREATE INDEX idx_matches_group_id ON matches(group_id);
CREATE INDEX idx_matches_giver_id ON matches(giver_id);

-- RLS for matches - CRITICAL: Users can ONLY see their own assignments
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own match" ON matches
  FOR SELECT USING (auth.uid() = giver_id);

CREATE POLICY "Admin can insert matches" ON matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups WHERE groups.id = matches.group_id AND groups.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admin can delete matches" ON matches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups WHERE groups.id = matches.group_id AND groups.admin_id = auth.uid()
    )
  );

-- ============================================
-- ACTIVITY LOG TABLE (optional, for group activity)
-- ============================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_group_id ON activities(group_id);

-- RLS for activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members WHERE members.group_id = activities.group_id AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create activities" ON activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM members WHERE members.group_id = activities.group_id AND members.user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get group by invite code (for joining)
CREATE OR REPLACE FUNCTION get_group_by_invite_code(code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  admin_id UUID,
  budget DECIMAL,
  exchange_date DATE,
  status group_status,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.name,
    g.admin_id,
    g.budget,
    g.exchange_date,
    g.status,
    COUNT(m.id) as member_count
  FROM groups g
  LEFT JOIN members m ON m.group_id = g.id
  WHERE g.invite_code = code
  GROUP BY g.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
