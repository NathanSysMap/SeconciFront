/*
  # Fix Users Table RLS Policy
  
  1. Changes
    - Allow anonymous read access to users table for auto-login
    - This enables the app to load user data without authentication
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own data" ON users;

-- Create new policy allowing read access
CREATE POLICY "Allow read access to users"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);
