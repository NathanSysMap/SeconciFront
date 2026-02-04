/*
  # Create Portal Tables
  
  1. New Tables
    - `payroll_imports` - Histórico de importações de folha de pagamento
    - `payroll_records` - Registros individuais da folha importada
    - `appointments` - Agendamentos de atendimentos
    - `payment_slips` - Boletos de pagamento
    - `payroll_events` - Eventos de folha (férias, faltas, afastamentos)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Payroll imports table
CREATE TABLE IF NOT EXISTS payroll_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  import_type text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  total_records integer DEFAULT 0,
  valid_records integer DEFAULT 0,
  invalid_records integer DEFAULT 0,
  status text DEFAULT 'processing',
  validation_summary jsonb,
  imported_by uuid REFERENCES auth.users(id),
  imported_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payroll_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payroll imports"
  ON payroll_imports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert payroll imports"
  ON payroll_imports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update payroll imports"
  ON payroll_imports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Payroll records table
CREATE TABLE IF NOT EXISTS payroll_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id uuid REFERENCES payroll_imports(id) ON DELETE CASCADE,
  employee_cpf text NOT NULL,
  employee_name text NOT NULL,
  reference_month date NOT NULL,
  base_salary decimal(10,2),
  overtime decimal(10,2),
  thirteenth_salary decimal(10,2),
  vacation decimal(10,2),
  absences decimal(10,2),
  fgts_value decimal(10,2),
  validation_status text DEFAULT 'pending',
  validation_errors jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payroll records"
  ON payroll_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert payroll records"
  ON payroll_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  appointment_type text NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time,
  status text DEFAULT 'scheduled',
  service_location text,
  professional_name text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Payment slips table
CREATE TABLE IF NOT EXISTS payment_slips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  due_date date NOT NULL,
  amount decimal(10,2) NOT NULL,
  barcode text,
  digitable_line text,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  extension_count integer DEFAULT 0,
  last_extension_date date,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_slips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment slips"
  ON payment_slips FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update payment slips"
  ON payment_slips FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Payroll events table
CREATE TABLE IF NOT EXISTS payroll_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_date date NOT NULL,
  start_date date,
  end_date date,
  days_count integer,
  value_impact decimal(10,2),
  description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payroll_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payroll events"
  ON payroll_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert payroll events"
  ON payroll_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update payroll events"
  ON payroll_events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payroll_imports_company ON payroll_imports(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_import ON payroll_records(import_id);
CREATE INDEX IF NOT EXISTS idx_appointments_company ON appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_employee ON appointments(employee_id);
CREATE INDEX IF NOT EXISTS idx_payment_slips_company ON payment_slips(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_events_company ON payroll_events(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_events_employee ON payroll_events(employee_id);
