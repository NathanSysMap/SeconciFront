/*
  # Create Work Locations and Billing Rules Tables

  1. New Tables
    - `work_locations` - Stores work locations for companies
      - `id` (uuid, primary key)
      - `company_id` (uuid, reference to companies)
      - `location_name` (text) - Name/description of the work location
      - `address` (text) - Full address
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `location_billing_rules` - Billing rules for each work location
      - `id` (uuid, primary key)
      - `work_location_id` (uuid, reference to work_locations)
      - `rule_type` (text) - Type of billing rule
      - `base_value` (decimal) - Base value for billing
      - `percentage` (decimal) - Percentage adjustment
      - `minimum_value` (decimal) - Minimum billing value
      - `valid_from` (date) - Start date
      - `valid_until` (date, nullable) - End date
      - `active` (boolean, default true)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read and write

  3. Indexes
    - Index on company_id for work_locations
    - Index on work_location_id for location_billing_rules
    - Index on active status for both tables
*/

CREATE TABLE IF NOT EXISTS work_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  location_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS location_billing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_location_id uuid REFERENCES work_locations(id) ON DELETE CASCADE NOT NULL,
  rule_type text NOT NULL,
  base_value decimal(10,2) DEFAULT 0,
  percentage decimal(5,2) DEFAULT 0,
  minimum_value decimal(10,2) DEFAULT 0,
  valid_from date NOT NULL,
  valid_until date,
  active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_billing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view work locations"
  ON work_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create work locations"
  ON work_locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update work locations"
  ON work_locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete work locations"
  ON work_locations FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can view location billing rules"
  ON location_billing_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create location billing rules"
  ON location_billing_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update location billing rules"
  ON location_billing_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete location billing rules"
  ON location_billing_rules FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_work_locations_company ON work_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_work_locations_active ON work_locations(active);
CREATE INDEX IF NOT EXISTS idx_location_billing_rules_location ON location_billing_rules(work_location_id);
CREATE INDEX IF NOT EXISTS idx_location_billing_rules_active ON location_billing_rules(active);
