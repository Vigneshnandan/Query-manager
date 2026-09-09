-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  role text CHECK (role IN ('citizen', 'official', 'dept_head', 'officer')),
  department text,
  created_at timestamptz DEFAULT now()
);

-- Tickets table
CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id uuid REFERENCES profiles(id),
  raw_text text NOT NULL,
  photo_url text,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Issues table
CREATE TABLE issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_ticket_id uuid REFERENCES tickets(id) NOT NULL,
  department text NOT NULL,
  issue_text text NOT NULL,
  deadline date,
  priority text CHECK (priority IN ('low', 'medium', 'high')),
  assigned_officer_id uuid REFERENCES profiles(id),
  status text DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'in_progress', 'resolved', 'escalated')),
  sla_deadline timestamptz,
  resolution_photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- WARNING: The following RLS policies are intentionally permissive for hackathon/demo purposes.
-- This configuration allows all authenticated users to perform all actions on all rows.
-- DO NOT use this in production. Implement proper per-user and per-role policies for real applications.

CREATE POLICY profiles_all ON profiles
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY tickets_all ON tickets
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY issues_all ON issues
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
