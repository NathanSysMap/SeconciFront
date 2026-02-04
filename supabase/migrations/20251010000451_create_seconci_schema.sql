/*
  # Seconci-SP Assistential Billing System - Complete Schema
  
  1. New Tables
    - `users` - System users with roles
    - `companies` - Client companies with contracts
    - `employees` - Company employees
    - `dependents` - Employee dependents
    - `billing_rules` - Billing rules by convention/location
    - `contract_validities` - Contract validity periods
    - `calculation_parameters` - Billing calculation parameters
    - `category_minimums` - Minimum values by category
    - `penalties` - Penalty rules
    - `batch_updates` - Batch file uploads tracking
    - `billing_batches` - Billing batch groupings
    - `invoices` - Generated invoices (boletos)
    - `nfse` - Electronic service invoices
    - `complementary_imports` - Additional data imports
    - `economic_groups` - Economic group consolidations
    - `alerts` - System alerts and deviations
    - `audit_logs` - Audit trail
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'operational',
  company_id uuid,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj text UNIQUE NOT NULL,
  corporate_name text NOT NULL,
  trade_name text,
  status text DEFAULT 'active',
  contract_type text,
  convention text,
  economic_group_id uuid,
  auto_billing_enabled boolean DEFAULT false,
  contact_email text,
  contact_phone text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage companies"
  ON companies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  cpf text NOT NULL,
  full_name text NOT NULL,
  registration_number text,
  category text,
  admission_date date,
  termination_date date,
  status text DEFAULT 'active',
  salary decimal(10,2),
  work_location text,
  esocial_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, cpf)
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage employees"
  ON employees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Dependents table
CREATE TABLE IF NOT EXISTS dependents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  cpf text NOT NULL,
  full_name text NOT NULL,
  relationship text NOT NULL,
  birth_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dependents"
  ON dependents FOR SELECT
  TO authenticated
  USING (true);

-- Billing rules table
CREATE TABLE IF NOT EXISTS billing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  convention text,
  work_location text,
  rule_type text NOT NULL,
  percentages jsonb,
  minimums jsonb,
  exceptions jsonb,
  valid_from date NOT NULL,
  valid_until date,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE billing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view billing rules"
  ON billing_rules FOR SELECT
  TO authenticated
  USING (true);

-- Contract validities table
CREATE TABLE IF NOT EXISTS contract_validities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  valid_from date NOT NULL,
  valid_until date,
  billing_rule_id uuid REFERENCES billing_rules(id),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contract_validities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contract validities"
  ON contract_validities FOR SELECT
  TO authenticated
  USING (true);

-- Calculation parameters table
CREATE TABLE IF NOT EXISTS calculation_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_name text NOT NULL,
  parameter_value jsonb NOT NULL,
  valid_from date NOT NULL,
  valid_until date,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calculation_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view calculation parameters"
  ON calculation_parameters FOR SELECT
  TO authenticated
  USING (true);

-- Category minimums table
CREATE TABLE IF NOT EXISTS category_minimums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  minimum_value decimal(10,2) NOT NULL,
  valid_from date NOT NULL,
  valid_until date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE category_minimums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view category minimums"
  ON category_minimums FOR SELECT
  TO authenticated
  USING (true);

-- Penalties table
CREATE TABLE IF NOT EXISTS penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  penalty_type text NOT NULL,
  description text,
  calculation_rule jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view penalties"
  ON penalties FOR SELECT
  TO authenticated
  USING (true);

-- Batch updates table
CREATE TABLE IF NOT EXISTS batch_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  upload_type text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  status text DEFAULT 'pending',
  validation_results jsonb,
  processed_records integer DEFAULT 0,
  error_records integer DEFAULT 0,
  uploaded_by uuid REFERENCES users(id),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE batch_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own batch updates"
  ON batch_updates FOR SELECT
  TO authenticated
  USING (true);

-- Billing batches table
CREATE TABLE IF NOT EXISTS billing_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name text NOT NULL,
  reference_month date NOT NULL,
  status text DEFAULT 'draft',
  total_companies integer DEFAULT 0,
  total_amount decimal(12,2) DEFAULT 0,
  created_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE billing_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view billing batches"
  ON billing_batches FOR SELECT
  TO authenticated
  USING (true);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  billing_batch_id uuid REFERENCES billing_batches(id),
  invoice_number text UNIQUE NOT NULL,
  reference_month date NOT NULL,
  due_date date NOT NULL,
  amount decimal(12,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_date date,
  barcode text,
  calculation_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

-- NFSe table
CREATE TABLE IF NOT EXISTS nfse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id),
  nfse_number text UNIQUE NOT NULL,
  verification_code text,
  issue_date date NOT NULL,
  service_description text,
  xml_data text,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nfse ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view nfse"
  ON nfse FOR SELECT
  TO authenticated
  USING (true);

-- Complementary imports table
CREATE TABLE IF NOT EXISTS complementary_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type text NOT NULL,
  company_id uuid REFERENCES companies(id),
  reference_month date NOT NULL,
  data jsonb NOT NULL,
  imported_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE complementary_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view complementary imports"
  ON complementary_imports FOR SELECT
  TO authenticated
  USING (true);

-- Economic groups table
CREATE TABLE IF NOT EXISTS economic_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  group_code text UNIQUE,
  consolidation_rules jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE economic_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view economic groups"
  ON economic_groups FOR SELECT
  TO authenticated
  USING (true);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text DEFAULT 'info',
  company_id uuid REFERENCES companies(id),
  reference_month date,
  title text NOT NULL,
  description text,
  alert_data jsonb,
  status text DEFAULT 'active',
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_cpf ON employees(cpf);
CREATE INDEX IF NOT EXISTS idx_dependents_employee ON dependents(employee_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_reference_month ON invoices(reference_month);
CREATE INDEX IF NOT EXISTS idx_batch_updates_company ON batch_updates(company_id);
CREATE INDEX IF NOT EXISTS idx_alerts_company ON alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
