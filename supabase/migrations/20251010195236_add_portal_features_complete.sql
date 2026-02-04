/*
  # Add Portal Features - Movement Reports, Campaigns, Auto Billing

  ## Overview
  This migration adds tables to support:
  - Movement tracking reports (30)
  - Incentive campaigns (31)
  - Automatic billing calculation and issuance (32)

  ## New Tables

  ### 1. movement_events
  Tracks all movement events (admissions, terminations, updates, etc.)

  ### 2. movement_reports
  Stores generated movement reports with KPIs

  ### 3. incentive_campaigns
  Manages promotional campaigns to encourage timely updates

  ### 4. campaign_eligibility
  Tracks which companies are eligible/awarded for each campaign

  ### 5. automatic_billing_config
  Global ON/OFF switch and company-level configurations

  ### 6. billing_calculations
  Stores calculation previews and final results

  ### 7. billing_requests
  Tracks automatic billing requests and their status

  ## Security
  - RLS enabled on all tables
  - Company users can only see their own data
  - Admin/operational have full access
*/

-- Movement Events (tracking all changes)
CREATE TABLE IF NOT EXISTS movement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('admission', 'termination', 'update', 'dependent_change', 'absence', 'return', 'address_change')),
  event_source text NOT NULL CHECK (event_source IN ('batch_upload', 'individual_update', 'payroll', 'esocial', 'fgts_digital')),
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  event_data jsonb NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id),
  location_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movement_events_company ON movement_events(company_id);
CREATE INDEX IF NOT EXISTS idx_movement_events_month ON movement_events(reference_month);
CREATE INDEX IF NOT EXISTS idx_movement_events_type ON movement_events(event_type);

ALTER TABLE movement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own movement events"
  ON movement_events FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "System can insert movement events"
  ON movement_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational', 'company')
    )
  );

-- Movement Reports
CREATE TABLE IF NOT EXISTS movement_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_month date NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  report_scope text NOT NULL CHECK (report_scope IN ('global', 'company', 'group', 'unit')),
  scope_id uuid,
  active_base_start integer NOT NULL,
  active_base_end integer NOT NULL,
  total_events integer NOT NULL DEFAULT 0,
  movement_percentage decimal(5,2) NOT NULL DEFAULT 0,
  admissions_count integer DEFAULT 0,
  terminations_count integer DEFAULT 0,
  updates_count integer DEFAULT 0,
  absences_count integer DEFAULT 0,
  companies_with_updates integer DEFAULT 0,
  companies_missing integer DEFAULT 0,
  missing_companies jsonb,
  event_breakdown jsonb NOT NULL,
  comparison_data jsonb,
  filters_applied jsonb,
  generated_by uuid REFERENCES users(id),
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movement_reports_month ON movement_reports(reference_month);
CREATE INDEX IF NOT EXISTS idx_movement_reports_company ON movement_reports(company_id);

ALTER TABLE movement_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own movement reports"
  ON movement_reports FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    OR
    report_scope = 'global'
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin and operational can create movement reports"
  ON movement_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Incentive Campaigns
CREATE TABLE IF NOT EXISTS incentive_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  target_competencies date[] NOT NULL,
  target_scope text NOT NULL CHECK (target_scope IN ('all', 'rule', 'unit', 'group', 'list')),
  target_criteria jsonb NOT NULL,
  eligibility_rules jsonb NOT NULL,
  benefit_type text NOT NULL CHECK (benefit_type IN ('discount_percentage', 'discount_fixed', 'base_reduction', 'informational')),
  benefit_value decimal(10,2),
  benefit_config jsonb,
  max_discount_per_company decimal(10,2),
  max_total_companies integer,
  priority integer DEFAULT 100,
  allow_accumulation boolean DEFAULT false,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'scheduled', 'expired', 'cancelled')),
  approval_mode text DEFAULT 'automatic' CHECK (approval_mode IN ('automatic', 'manual')),
  companies_awarded integer DEFAULT 0,
  total_benefit_amount decimal(12,2) DEFAULT 0,
  created_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incentive_campaigns_status ON incentive_campaigns(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_incentive_campaigns_dates ON incentive_campaigns(valid_from, valid_until);

ALTER TABLE incentive_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view active campaigns"
  ON incentive_campaigns FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin can manage campaigns"
  ON incentive_campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Campaign Eligibility
CREATE TABLE IF NOT EXISTS campaign_eligibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES incentive_campaigns(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  eligible boolean NOT NULL DEFAULT false,
  eligibility_checked_at timestamptz DEFAULT now(),
  criteria_met jsonb,
  awarded boolean DEFAULT false,
  awarded_at timestamptz,
  benefit_amount decimal(10,2) DEFAULT 0,
  benefit_applied boolean DEFAULT false,
  benefit_applied_at timestamptz,
  decision_log jsonb NOT NULL,
  approved_by uuid REFERENCES users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, company_id, reference_month)
);

CREATE INDEX IF NOT EXISTS idx_campaign_eligibility_campaign ON campaign_eligibility(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_eligibility_company ON campaign_eligibility(company_id);
CREATE INDEX IF NOT EXISTS idx_campaign_eligibility_awarded ON campaign_eligibility(awarded) WHERE awarded = true;

ALTER TABLE campaign_eligibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own eligibility"
  ON campaign_eligibility FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "System can manage eligibility"
  ON campaign_eligibility FOR ALL
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

-- Automatic Billing Configuration
CREATE TABLE IF NOT EXISTS automatic_billing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  global_enabled boolean DEFAULT false,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  company_enabled boolean DEFAULT true,
  validation_rules jsonb NOT NULL DEFAULT '{"require_no_alerts": true, "require_active_company": true, "require_valid_rule": true}'::jsonb,
  blocking_policies jsonb,
  last_toggled_by uuid REFERENCES users(id),
  last_toggled_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id)
);

CREATE INDEX IF NOT EXISTS idx_auto_billing_config_enabled ON automatic_billing_config(global_enabled, company_enabled);

ALTER TABLE automatic_billing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own config"
  ON automatic_billing_config FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    OR
    company_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin can manage auto billing config"
  ON automatic_billing_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Billing Calculations (preview and final)
CREATE TABLE IF NOT EXISTS billing_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  calculation_type text NOT NULL CHECK (calculation_type IN ('preview', 'final')),
  base_amount decimal(12,2) NOT NULL,
  dependents_amount decimal(12,2) DEFAULT 0,
  absent_amount decimal(12,2) DEFAULT 0,
  penalties_amount decimal(12,2) DEFAULT 0,
  adjustments_amount decimal(12,2) DEFAULT 0,
  campaign_benefit_amount decimal(12,2) DEFAULT 0,
  discounts_amount decimal(12,2) DEFAULT 0,
  total_amount decimal(12,2) NOT NULL,
  components_breakdown jsonb NOT NULL,
  parameters_snapshot jsonb NOT NULL,
  validation_results jsonb NOT NULL,
  passed_validation boolean NOT NULL DEFAULT false,
  blocking_issues jsonb,
  calculation_hash text,
  confirmed_by uuid REFERENCES users(id),
  confirmed_at timestamptz,
  ip_address text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, reference_month, calculation_type, created_at)
);

CREATE INDEX IF NOT EXISTS idx_billing_calculations_company ON billing_calculations(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_calculations_month ON billing_calculations(reference_month);
CREATE INDEX IF NOT EXISTS idx_billing_calculations_type ON billing_calculations(calculation_type);

ALTER TABLE billing_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own calculations"
  ON billing_calculations FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Companies can create their own calculations"
  ON billing_calculations FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

-- Billing Requests (automatic issuance)
CREATE TABLE IF NOT EXISTS billing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  calculation_id uuid NOT NULL REFERENCES billing_calculations(id) ON DELETE RESTRICT,
  request_type text NOT NULL CHECK (request_type IN ('simulation', 'issuance')),
  request_status text NOT NULL DEFAULT 'pending' CHECK (request_status IN ('pending', 'processing', 'issued', 'error', 'cancelled')),
  protocol text,
  boleto_data jsonb,
  barcode text,
  digitable_line text,
  due_date date,
  amount decimal(12,2) NOT NULL,
  error_message text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  requested_by uuid REFERENCES users(id),
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  issued_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES users(id),
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_requests_company ON billing_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_requests_month ON billing_requests(reference_month);
CREATE INDEX IF NOT EXISTS idx_billing_requests_status ON billing_requests(request_status) WHERE request_status IN ('pending', 'processing');

ALTER TABLE billing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own billing requests"
  ON billing_requests FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Companies can create their own billing requests"
  ON billing_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'operational')
    )
  );

CREATE POLICY "Admin can manage billing requests"
  ON billing_requests FOR UPDATE
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

-- Insert default global config (OFF by default)
INSERT INTO automatic_billing_config (id, global_enabled, company_id, notes)
VALUES (gen_random_uuid(), false, NULL, 'Global automatic billing configuration - controlled by Seconci-SP Admin')
ON CONFLICT DO NOTHING;
