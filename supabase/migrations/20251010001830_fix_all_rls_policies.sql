/*
  # Fix RLS Policies for All Tables
  
  1. Changes
    - Allow anonymous and authenticated read access to all tables
    - This enables the demo to work without authentication
*/

-- Companies
DROP POLICY IF EXISTS "Authenticated users can view companies" ON companies;
DROP POLICY IF EXISTS "Admin can manage companies" ON companies;

CREATE POLICY "Allow read access to companies"
  ON companies FOR SELECT
  TO anon, authenticated
  USING (true);

-- Employees
DROP POLICY IF EXISTS "Authenticated users can view employees" ON employees;
DROP POLICY IF EXISTS "Admin can manage employees" ON employees;

CREATE POLICY "Allow read access to employees"
  ON employees FOR SELECT
  TO anon, authenticated
  USING (true);

-- Dependents
DROP POLICY IF EXISTS "Authenticated users can view dependents" ON dependents;

CREATE POLICY "Allow read access to dependents"
  ON dependents FOR SELECT
  TO anon, authenticated
  USING (true);

-- Billing Rules
DROP POLICY IF EXISTS "Authenticated users can view billing rules" ON billing_rules;

CREATE POLICY "Allow read access to billing_rules"
  ON billing_rules FOR SELECT
  TO anon, authenticated
  USING (true);

-- Contract Validities
DROP POLICY IF EXISTS "Authenticated users can view contract validities" ON contract_validities;

CREATE POLICY "Allow read access to contract_validities"
  ON contract_validities FOR SELECT
  TO anon, authenticated
  USING (true);

-- Calculation Parameters
DROP POLICY IF EXISTS "Authenticated users can view calculation parameters" ON calculation_parameters;

CREATE POLICY "Allow read access to calculation_parameters"
  ON calculation_parameters FOR SELECT
  TO anon, authenticated
  USING (true);

-- Category Minimums
DROP POLICY IF EXISTS "Authenticated users can view category minimums" ON category_minimums;

CREATE POLICY "Allow read access to category_minimums"
  ON category_minimums FOR SELECT
  TO anon, authenticated
  USING (true);

-- Penalties
DROP POLICY IF EXISTS "Authenticated users can view penalties" ON penalties;

CREATE POLICY "Allow read access to penalties"
  ON penalties FOR SELECT
  TO anon, authenticated
  USING (true);

-- Batch Updates
DROP POLICY IF EXISTS "Users can view own batch updates" ON batch_updates;

CREATE POLICY "Allow read access to batch_updates"
  ON batch_updates FOR SELECT
  TO anon, authenticated
  USING (true);

-- Billing Batches
DROP POLICY IF EXISTS "Authenticated users can view billing batches" ON billing_batches;

CREATE POLICY "Allow read access to billing_batches"
  ON billing_batches FOR SELECT
  TO anon, authenticated
  USING (true);

-- Invoices
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON invoices;

CREATE POLICY "Allow read access to invoices"
  ON invoices FOR SELECT
  TO anon, authenticated
  USING (true);

-- NFSe
DROP POLICY IF EXISTS "Authenticated users can view nfse" ON nfse;

CREATE POLICY "Allow read access to nfse"
  ON nfse FOR SELECT
  TO anon, authenticated
  USING (true);

-- Complementary Imports
DROP POLICY IF EXISTS "Authenticated users can view complementary imports" ON complementary_imports;

CREATE POLICY "Allow read access to complementary_imports"
  ON complementary_imports FOR SELECT
  TO anon, authenticated
  USING (true);

-- Economic Groups
DROP POLICY IF EXISTS "Authenticated users can view economic groups" ON economic_groups;

CREATE POLICY "Allow read access to economic_groups"
  ON economic_groups FOR SELECT
  TO anon, authenticated
  USING (true);

-- Alerts
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON alerts;

CREATE POLICY "Allow read access to alerts"
  ON alerts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Audit Logs
DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;

CREATE POLICY "Allow read access to audit_logs"
  ON audit_logs FOR SELECT
  TO anon, authenticated
  USING (true);
