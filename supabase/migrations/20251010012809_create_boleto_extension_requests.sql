/*
  # Create Boleto Extension Requests Table

  1. New Tables
    - `boleto_extension_requests` - Stores requests for boleto payment extensions
      - `id` (uuid, primary key)
      - `company_id` (uuid, reference to companies)
      - `boleto_number` (text)
      - `original_due_date` (date)
      - `requested_due_date` (date)
      - `reason` (text)
      - `status` (enum: pending, approved, rejected)
      - `requested_by` (uuid, reference to auth.users)
      - `reviewed_by` (uuid, reference to auth.users, nullable)
      - `review_notes` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `boleto_extension_requests` table
    - Add policies for authenticated users

  3. Indexes
    - Index on company_id for fast lookups
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS boleto_extension_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  boleto_number text NOT NULL,
  original_due_date date NOT NULL,
  requested_due_date date NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by uuid REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  review_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE boleto_extension_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view boleto extension requests"
  ON boleto_extension_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create boleto extension requests"
  ON boleto_extension_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update boleto extension requests"
  ON boleto_extension_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_boleto_extension_requests_company ON boleto_extension_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_boleto_extension_requests_status ON boleto_extension_requests(status);
