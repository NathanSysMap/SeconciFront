/*
  # Create Billing Management Tables

  ## Overview
  This migration creates tables to support all billing management functionalities:
  - Company billing rule updates
  - Penalty applications
  - Payroll adjustments
  - Sampling (1/12)
  - Manual/Automatic billing transfers
  - Billing alerts and deviations
  - Export parameters

  ## New Tables

  1. `company_billing_rules`
     - Tracks billing rules applied to specific companies
     - Links companies to their active billing rules
     - Supports rule change history

  2. `penalty_applications`
     - Records when penalties are applied to companies
     - Tracks penalty reasons and amounts
     - Links to the penalties configuration table

  3. `payroll_adjustments`
     - Records payroll-based billing adjustments
     - Tracks companies that informed total payroll above calculated
     - Stores adjustment reasons and values

  4. `sampling_groups`
     - Manages 1/12 sampling groups
     - Tracks which companies are in each sampling period
     - Links to billing rules

  5. `billing_mode_transfers`
     - Records transfers between manual and automatic billing
     - Tracks transfer reasons and dates
     - Maintains transfer history

  6. `manual_billing_parameters`
     - Stores parameters for manual billing entries
     - Configurable per company or global
     - Includes calculation overrides

  7. `export_parameters`
     - Configuration for billing data exports
     - File format settings
     - Export schedules and recipients

  8. `billing_alerts`
     - Alerts for billing deviations
     - Employee count and calculation base discrepancies
     - Alert status tracking

  ## Security
  - RLS enabled on all tables
  - Policies restrict access to authenticated admin/operational users
*/

-- Company Billing Rules Assignment
CREATE TABLE IF NOT EXISTS company_billing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  billing_rule_id uuid NOT NULL REFERENCES billing_rules(id) ON DELETE RESTRICT,
  effective_date date NOT NULL,
  end_date date,
  assigned_by uuid REFERENCES users(id),
  assignment_reason text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_billing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can view company billing rules"
  ON company_billing_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can insert company billing rules"
  ON company_billing_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can update company billing rules"
  ON company_billing_rules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Penalty Applications
CREATE TABLE IF NOT EXISTS penalty_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  penalty_id uuid NOT NULL REFERENCES penalties(id) ON DELETE RESTRICT,
  reference_month date NOT NULL,
  applied_date timestamptz DEFAULT now(),
  penalty_amount decimal(10,2) NOT NULL DEFAULT 0,
  penalty_percentage decimal(5,2),
  reason text NOT NULL,
  occurrence_count integer DEFAULT 1,
  applied_by uuid REFERENCES users(id),
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'reversed', 'disputed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE penalty_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can view penalty applications"
  ON penalty_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can insert penalty applications"
  ON penalty_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can update penalty applications"
  ON penalty_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Payroll Adjustments
CREATE TABLE IF NOT EXISTS payroll_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  calculated_amount decimal(12,2) NOT NULL,
  informed_amount decimal(12,2) NOT NULL,
  adjustment_amount decimal(12,2) NOT NULL,
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('above_calculated', 'payroll_sent', 'manual_override')),
  adjustment_reason text,
  previous_billing_rule_id uuid REFERENCES billing_rules(id),
  new_billing_rule_id uuid REFERENCES billing_rules(id),
  adjusted_by uuid REFERENCES users(id),
  approved boolean DEFAULT false,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payroll_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can view payroll adjustments"
  ON payroll_adjustments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can insert payroll adjustments"
  ON payroll_adjustments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can update payroll adjustments"
  ON payroll_adjustments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Sampling Groups (1/12)
CREATE TABLE IF NOT EXISTS sampling_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_rule_id uuid NOT NULL REFERENCES billing_rules(id) ON DELETE CASCADE,
  reference_year integer NOT NULL,
  sample_month integer NOT NULL CHECK (sample_month BETWEEN 1 AND 12),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  selected_date timestamptz DEFAULT now(),
  selected_by uuid REFERENCES users(id),
  active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(billing_rule_id, reference_year, company_id)
);

ALTER TABLE sampling_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can view sampling groups"
  ON sampling_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can insert sampling groups"
  ON sampling_groups FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can update sampling groups"
  ON sampling_groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Billing Mode Transfers
CREATE TABLE IF NOT EXISTS billing_mode_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  from_mode text NOT NULL CHECK (from_mode IN ('automatic', 'manual')),
  to_mode text NOT NULL CHECK (to_mode IN ('automatic', 'manual')),
  transfer_date timestamptz DEFAULT now(),
  effective_from date NOT NULL,
  reason text NOT NULL,
  transferred_by uuid REFERENCES users(id),
  approved boolean DEFAULT false,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE billing_mode_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can view billing mode transfers"
  ON billing_mode_transfers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can insert billing mode transfers"
  ON billing_mode_transfers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can update billing mode transfers"
  ON billing_mode_transfers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Manual Billing Parameters
CREATE TABLE IF NOT EXISTS manual_billing_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  parameter_name text NOT NULL,
  parameter_value jsonb NOT NULL,
  parameter_type text NOT NULL CHECK (parameter_type IN ('percentage', 'fixed_value', 'formula', 'rule_override')),
  applies_to text DEFAULT 'specific' CHECK (applies_to IN ('global', 'specific')),
  effective_from date NOT NULL,
  effective_until date,
  created_by uuid REFERENCES users(id),
  active boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE manual_billing_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can view manual billing parameters"
  ON manual_billing_parameters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can insert manual billing parameters"
  ON manual_billing_parameters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can update manual billing parameters"
  ON manual_billing_parameters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Export Parameters
CREATE TABLE IF NOT EXISTS export_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_name text NOT NULL,
  export_type text NOT NULL CHECK (export_type IN ('boletos', 'nfse', 'accounting', 'full_billing')),
  file_format text NOT NULL CHECK (file_format IN ('csv', 'xlsx', 'txt', 'xml', 'json')),
  field_mapping jsonb NOT NULL,
  delimiter text,
  encoding text DEFAULT 'UTF-8',
  include_header boolean DEFAULT true,
  schedule_config jsonb,
  recipients jsonb,
  active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE export_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can view export parameters"
  ON export_parameters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can insert export parameters"
  ON export_parameters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can update export parameters"
  ON export_parameters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Billing Alerts
CREATE TABLE IF NOT EXISTS billing_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('employee_count_deviation', 'calculation_base_deviation', 'missing_update', 'payroll_discrepancy')),
  reference_month date NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  expected_value decimal(12,2),
  actual_value decimal(12,2),
  deviation_percentage decimal(5,2),
  alert_message text NOT NULL,
  sent_to_company boolean DEFAULT false,
  sent_at timestamptz,
  company_acknowledged boolean DEFAULT false,
  acknowledged_at timestamptz,
  status text DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  resolution_notes text,
  created_by uuid REFERENCES users(id),
  resolved_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE billing_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can view billing alerts"
  ON billing_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Companies can view their own alerts"
  ON billing_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.company_id = billing_alerts.company_id
    )
  );

CREATE POLICY "Admin and operational can insert billing alerts"
  ON billing_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can update billing alerts"
  ON billing_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_billing_rules_company ON company_billing_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_company_billing_rules_active ON company_billing_rules(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_penalty_applications_company ON penalty_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_penalty_applications_month ON penalty_applications(reference_month);
CREATE INDEX IF NOT EXISTS idx_payroll_adjustments_company ON payroll_adjustments(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_adjustments_month ON payroll_adjustments(reference_month);
CREATE INDEX IF NOT EXISTS idx_sampling_groups_rule ON sampling_groups(billing_rule_id);
CREATE INDEX IF NOT EXISTS idx_sampling_groups_year ON sampling_groups(reference_year);
CREATE INDEX IF NOT EXISTS idx_billing_mode_transfers_company ON billing_mode_transfers(company_id);
CREATE INDEX IF NOT EXISTS idx_manual_billing_parameters_company ON manual_billing_parameters(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_alerts_company ON billing_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_alerts_status ON billing_alerts(status) WHERE status = 'open';
