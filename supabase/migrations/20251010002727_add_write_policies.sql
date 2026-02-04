/*
  # Add Write Policies for CRUD Operations
  
  1. Changes
    - Add INSERT, UPDATE, DELETE policies for companies, employees, and dependents
    - Allow anon and authenticated users to perform write operations for demo purposes
*/

-- Companies write policies
CREATE POLICY "Allow insert companies"
  ON companies FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update companies"
  ON companies FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Employees write policies
CREATE POLICY "Allow insert employees"
  ON employees FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update employees"
  ON employees FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Dependents write policies
CREATE POLICY "Allow insert dependents"
  ON dependents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update dependents"
  ON dependents FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
