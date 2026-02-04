/*
  # Add Write Policies for Billing Rules
  
  1. Changes
    - Add INSERT and UPDATE policies for billing_rules table
    - Allow anon and authenticated users to perform write operations
*/

-- Billing rules write policies
CREATE POLICY "Allow insert billing_rules"
  ON billing_rules FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update billing_rules"
  ON billing_rules FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
