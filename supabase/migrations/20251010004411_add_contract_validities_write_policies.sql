/*
  # Add Write Policies for Contract Validities
  
  1. Changes
    - Add INSERT and UPDATE policies for contract_validities table
    - Allow anon and authenticated users to perform write operations
*/

-- Contract validities write policies
CREATE POLICY "Allow insert contract_validities"
  ON contract_validities FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update contract_validities"
  ON contract_validities FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
